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

  async execute(command: GoogleRegistrationUseCaseCommand): Promise<{ accessToken: string; refreshToken: string}> {
    const { googleId, email, ip, device } = command.dto;

    const providerClient = await this.usersRepo.findByGoogleId(googleId);
    const { user, provider } = await this.usersRepo.findUserAndProviderByEmail(email);


    let userId: string;

    switch (true) {
      case !!providerClient:
        userId = await this.handleProviderUserIdExists({ providerClient, email });
        break;

      case !user && !provider:
        userId = await this.handleCreateUserAndProvider({ email, googleId });
        break;

      case !!user && !provider:
        userId = await this.handleCreateProviderForExistingUser({ user, googleId, email });
        break;

      case !!user && !!provider:
        userId = await this.handleCreateProviderForUserAndProvider({ user, provider, googleId, email });
        break;

      default:
        if (!provider) throw new Error('Provider must be defined');
        userId = await this.handleCreateProviderForEmailOnlyProvider({ provider, googleId, email });
        break;
    }

    const loginDto = { ip, device, userId };
    return this.commandBus.execute(new LoginUserCommand(loginDto));
  }

  private async handleProviderUserIdExists(params: { providerClient: UserProvider; email: string }) {
    const { providerClient, email } = params;

    const user = await this.usersRepo.findById(providerClient.userId);

    if (!user) {
      throw new Error(`User with id ${providerClient.userId} not found.`);
    }

    if (user.email === email) {
      return providerClient.userId;
    }

    await this.usersRepo.updateEmailInUserProvider(providerClient.id, email);

    return providerClient.userId;
  }

  private async handleCreateUserAndProvider(params: {
    email: string;
    googleId: string;
  }) {
    const { email, googleId } = params;
    const uniqueLogin = await this.generateUniqueLogin(email);
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

    await this.usersRepo.createUserConfirmationWithTrueFlag(
      createdUser.id,
      userConfirmation,
    );
    const userProviderDto: UserProviderInputDto = {
      provider: AuthProvider.GOOGLE,
      providerUserId: googleId,
      email,
      userId: createdUser.id,
    };
    await this.usersRepo.createUserProvider(userProviderDto);

    return createdUser.id;
  }

  private async handleCreateProviderForEmailOnlyProvider(params: {
    provider: UserProvider;
    googleId: string;
    email: string;
  }) {
    const { provider, googleId, email } = params;
    const userId = provider.userId;
    const userExists = await this.usersRepo.findById(userId);
    if (!userExists) {
      throw new Error(`User with id ${userId} not found. Cannot create userProvider without a valid user.`);
    }
    const userProviderDto: UserProviderInputDto = {
      provider: AuthProvider.GOOGLE,
      providerUserId: googleId,
      email,
      userId,
    };
    await this.usersRepo.createUserProvider(userProviderDto);

    return userId;
  }

  private async handleCreateProviderForExistingUser(params: {
    user: UserModel;
    googleId: string;
    email: string;
  }) {
    const { user, googleId, email } = params;
    const userProviderDto: UserProviderInputDto = {
      provider: AuthProvider.GOOGLE,
      providerUserId: googleId,
      email,
      userId: user.id,
    };

    await this.usersRepo.createUserProvider(userProviderDto);

    return user.id;
  }

  private async handleCreateProviderForUserAndProvider(params: {
    user: UserModel;
    provider: UserProvider;
    googleId: string;
    email: string;
  }) {
    const { user, provider, googleId, email} = params;
    const userProviderDto: UserProviderInputDto = {
      provider: AuthProvider.GOOGLE,
      providerUserId: googleId,
      email,
      userId: provider.userId,
    };

    await this.usersRepo.createUserProvider(userProviderDto);

    return provider.userId;
  }
  async generateUniqueLogin(email: string): Promise<string> {
    const baseLogin = email.split('@')[0];

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
