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
