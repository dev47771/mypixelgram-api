import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users.repo';
import { ConfigService } from '@nestjs/config';
import { LoginUserCommand } from './login-user.use-case';
import { CreateUserRepoDto } from '../../infrastructure/dto/create-user.repo-dto';
import { UserProviderInputDto } from '../../api/input-dto/user.provider.dto';
import { GoogleInputDto } from '../../api/input-dto/googleInputDto';
import { UserProvider } from '@prisma/client';
import { User as UserModel } from '.prisma/client';
import { CreateUserConfirmationRepoDto } from '../../infrastructure/dto/create-user-confirmation.repo-dto';
import { AuthProvider } from '../../dto/auth-provider';

export class GoogleRegistrationUseCaseCommand {
  constructor(public dto: GoogleInputDto) {}
}

@CommandHandler(GoogleRegistrationUseCaseCommand)
export class GoogleRegistrationUseCase
  implements ICommandHandler<GoogleRegistrationUseCaseCommand>
{
  constructor(
    private usersRepo: UsersRepo,
    protected configService: ConfigService,
    protected commandBus: CommandBus,
  ) {}

  async execute(
    command: GoogleRegistrationUseCaseCommand,
  ): Promise<{ accessToken: string }> {
    const { googleId, email, ip, device, login } = command.dto;

    const providerClient = await this.usersRepo.findByGoogleId(googleId);

    if (providerClient) {
      return this.handleProviderUserIdExists({
        providerClient,
        email,
        ip,
        device,
      });
    }

    const user = await this.usersRepo.findByEmail(email);
    const provider = await this.usersRepo.checkEmailInUserProvider(email);

    if (!user && !provider) {
      return this.handleCreateUserAndProvider({
        email,
        login,
        googleId,
        ip,
        device,
      });
    }

    if (!user && provider) {
      return this.handleCreateProviderForEmailOnlyProvider({
        provider,
        googleId,
        email,
        ip,
        device,
      });
    }

    if (user && !provider) {
      return this.handleCreateProviderForExistingUser({
        user,
        googleId,
        email,
        ip,
        device,
      });
    }

    if (user && provider) {
      return this.handleCreateProviderForUserAndProvider({
        user,
        provider,
        googleId,
        email,
        ip,
        device,
      });
    }

    throw new Error('Unknown registration state');
  }

  private async handleProviderUserIdExists(params: {
    providerClient: UserProvider;
    email: string;
    ip: string;
    device: string;
  }) {
    const { providerClient, email, ip, device } = params;

    const user = await this.usersRepo.findById(providerClient.userId);

    if (!user) {
      throw new Error(`User with id ${providerClient.userId} not found.`);
    }

    if (user.email === email) {
      const loginDto = {
        ip,
        device,
        userId: providerClient.userId,
      };
      return this.commandBus.execute(new LoginUserCommand(loginDto));
    }

    await this.usersRepo.updateEmailInUserProvider(providerClient.id, email);

    const loginDto = {
      ip,
      device,
      userId: providerClient.userId,
    };
    return this.commandBus.execute(new LoginUserCommand(loginDto));
  }

  private async handleCreateUserAndProvider(params: {
    email: string;
    login: string;
    googleId: string;
    ip: string;
    device: string;
  }) {
    const { email, login, googleId, ip, device } = params;
    const uniqueLogin = await this.generateUniqueLogin(login);
    const userDto: CreateUserRepoDto = {
      email,
      login: uniqueLogin,
      passwordHash: null,
    };
    const createdUser = await this.usersRepo.createUser(userDto);

    const userConfirmation: CreateUserConfirmationRepoDto = {
      isConfirmed: true,
      expirationDate: null,
      confirmationCode: null,
      isAgreeWithPrivacy: true,
    };
    try {
      await this.usersRepo.createUserConfirmationWithTrueFlag(
        createdUser.id,
        userConfirmation,
      );
    } catch (err) {
      console.error(`Failed to update user confirmation for userId ${createdUser.id}:`, err);
    }
    const userProviderDto: UserProviderInputDto = {
      provider: AuthProvider.GOOGLE,
      providerUserId: googleId,
      email,
      userId: createdUser.id,
    };
    await this.usersRepo.createUserProvider(userProviderDto);

    const loginDto = {
      ip,
      device,
      userId: createdUser.id,
    };
    console.log("here2");
    return this.commandBus.execute(new LoginUserCommand(loginDto));
  }

  private async handleCreateProviderForEmailOnlyProvider(params: {
    provider: UserProvider;
    googleId: string;
    email: string;
    ip: string;
    device: string;
  }) {
    const { provider, googleId, email, ip, device } = params;
    const userId = provider.userId;
    const userExists = await this.usersRepo.findById(userId);
    if (!userExists) {
      throw new Error(
        `User with id ${userId} not found. Cannot create userProvider without a valid user.`,
      );
    }
    const userProviderDto: UserProviderInputDto = {
      provider: AuthProvider.GOOGLE,
      providerUserId: googleId,
      email,
      userId,
    };
    await this.usersRepo.createUserProvider(userProviderDto);

    const loginDto = {
      ip,
      device,
      userId,
    };
    return this.commandBus.execute(new LoginUserCommand(loginDto));
  }

  private async handleCreateProviderForExistingUser(params: {
    user: UserModel;
    googleId: string;
    email: string;
    ip: string;
    device: string;
  }) {
    const { user, googleId, email, ip, device } = params;
    const userProviderDto: UserProviderInputDto = {
      provider: AuthProvider.GOOGLE,
      providerUserId: googleId,
      email,
      userId: user.id,
    };
    try {
      await this.usersRepo.createUserProvider(userProviderDto);
    } catch (err) {
      console.error(`Failed to save user provider `, err);}

    const loginDto = {
      ip,
      device,
      userId: user.id,
    };
    return this.commandBus.execute(new LoginUserCommand(loginDto));
  }

  private async handleCreateProviderForUserAndProvider(params: {
    user: UserModel;
    provider: UserProvider;
    googleId: string;
    email: string;
    ip: string;
    device: string;
  }) {
    const { user, provider, googleId, email, ip, device } = params;
    const userProviderDto: UserProviderInputDto = {
      provider: AuthProvider.GOOGLE,
      providerUserId: googleId,
      email,
      userId: provider.userId,
    };
    try {
      await this.usersRepo.createUserProvider(userProviderDto);
    } catch (err) {
      console.error(`Failed to save user provider `, err);}
    const loginDto = {
      ip,
      device,
      userId: provider.userId,
    };
    return this.commandBus.execute(new LoginUserCommand(loginDto));
  }

  async generateUniqueLogin(baseLogin: string): Promise<string> {
    if (!(await this.usersRepo.findByLogin(baseLogin))) {
      return baseLogin;
    }
    let suffix = 1;
    let candidate = `${baseLogin}${suffix}`;
    while (await this.usersRepo.findByLogin(candidate)) {
      suffix++;
      candidate = `${baseLogin}${suffix}`;
    }
    return candidate;
  }
}
// const user = await this.usersRepo.findByEmail(email);
// const provider = await this.usersRepo.checkEmailInUserProvider(email);
// //2.0
// if (!user && !provider) {
//   const uniqueLogin = await this.generateUniqueLogin(login)
//   const userDto: CreateUserRepoDto = {
//     email: email,
//     login: uniqueLogin,
//     passwordHash: null,
//   };
//   const createUser = await this.usersRepo.createUser(userDto);
//   const userConfirmationDto: CreateUserConfirmationRepoDto = {
//     isConfirmed: true,
//     expirationDate: null,
//     confirmationCode: null,
//     isAgreeWithPrivacy: true,
//   };
//   await this.usersRepo.updateConfirm(
//     createUser.id,
//     userConfirmationDto,
//   );
//   //2.1
//   const userProviderDto: UserProviderInputDto = {
//     provider: 'google',
//     providerUserId: googleId,
//     login: login,
//     email: email,
//     userId: createUser.id, //достанем из сущности user из только что созданного userDto
//   };
//   await this.usersRepo.createUserProvider(userProviderDto);
//
// }
// //2.1
// if(!user&&provider){
//   // то значит в provider лежит какой-то емаил который был изменен после
//   // и как будто нужно достать из найденного provider userId
//   // и создать новую сущность userProvider с этими данными не создавая юзера нового основного
//   const { userId } = provider;
//   const userProviderDto: UserProviderInputDto = {
//     provider: 'google',
//     providerUserId: googleId,
//     login: login,
//     email: email,
//     userId: userId,
//   };
//   await this.usersRepo.createUserProvider(userProviderDto);
//
//
// }
// //1 && 1.2
// if (user && !provider) {
//   //достаем данные из user то есть userId и создаем сущность новую userProvider кладя туда userId
//   const { id } = user;
//   const userProviderDto: UserProviderInputDto = {
//     provider: 'google',
//     providerUserId: googleId,
//     login: login,
//     email: email,
//     userId: id,
//   };
//   await this.usersRepo.createUserProvider(userProviderDto);
//
//
// }
// //1 && 1.2
// if(user&&provider){
//   //создаем просто новый userProvider вытащив из user userİd и кладем его в новый userProvider
//   const { userId } = provider;
//   const userProviderDto: UserProviderInputDto = {
//     provider: 'google',
//     providerUserId: googleId,
//     login: login,
//     email: email,
//     userId: userId,
//   };
//   await this.usersRepo.createUserProvider(userProviderDto);
// }
// try {
//   const loginDto = {
//     ip: ip,
//     device: device,
//     userId: createUser.id,
//   };
//
//   return await this.commandBus.execute(new LoginUserCommand(loginDto));
// } catch (e) {
//   console.error(e);
// }
// }
// async generateUniqueLogin(baseLogin: string): Promise<string> {
//   if (!(await this.usersRepo.findByLogin(baseLogin))) {
//   return baseLogin;
// }
// let suffix = 1;
// let candidate = `${baseLogin}${suffix}`;
// while (await this.usersRepo.findByLogin(candidate)) {
//   suffix++;
//   candidate = `${baseLogin}${suffix}`;
// }
// return candidate;
// }
//
// //---- user c таким email есть в нашей системе создаем только учетную запись в user-provider и выдаем токены
// // const foundUser = await this.usersRepo.findByEmail(email);
// //
// //   await this.usersRepo.createUserProvider(userProviderDto);
// //   const loginDto = {
// //     ip: ip,
// //     device: device,
// //     userId: foundUser!.id,
// //   };
// //   return await this.commandBus.execute(new LoginUserCommand(loginDto));
// // }
// }