import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users.repo';
import { User, UserProvider } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { GithubInputDto } from '../../api/input-dto/githubInputDto';
import { LoginUserCommand } from './login-user.use-case';
import { LoginGenerateService } from '../login.generate.service';
import { Logger } from '@nestjs/common';

export class GithubRegisterUseCaseCommand {
  constructor(public dto: GithubInputDto) {}
}

@CommandHandler(GithubRegisterUseCaseCommand)
export class GithubRegisterUseCase
  implements ICommandHandler<GithubRegisterUseCaseCommand>
{
  private readonly logger = new Logger(GithubRegisterUseCase.name);
  constructor(
    private usersRepo: UsersRepo,
    protected configService: ConfigService,
    protected commandBus: CommandBus,
    protected loginGenerateService: LoginGenerateService,
  ) {}

  async execute(command: GithubRegisterUseCaseCommand) {
    const { githubId, email, ip, device, login } = command.dto;

    const existingGithubUser = await this.handleExistingGithubUser(
      githubId,
      email,
      ip,
      device,
    );
    if (existingGithubUser) return existingGithubUser;

    return await this.handleNewGithubUser(githubId, email, ip, device, login);
  }

  private async handleNewGithubUser(
    githubId: string,
    email: string,
    ip: string,
    device: string,
    login: string,
  ): Promise<{ accessToken: string } | undefined> {
    const checkEmailInUser: User | null =
      await this.usersRepo.findByEmail(email);
    const checkEmailProvider: UserProvider | null =
      await this.usersRepo.findProviderByEmail(email);

    if (!checkEmailInUser && !checkEmailProvider) {
      const uniqueLogin = await this.generateUniqueLogin(login);

      const newUser = await this.usersRepo.createUser(
        this.getUserDto(email, uniqueLogin),
      );
      await this.usersRepo.createUserProvider(
        this.getProviderDto(githubId, newUser.login, newUser.email, newUser.id),
      );

      return this.loginUser(ip, device, newUser.id);
    }

    if (checkEmailInUser) {
      await this.usersRepo.createUserProvider(
        this.getProviderDto(githubId, login, email, checkEmailInUser.id),
      );
      return this.loginUser(ip, device, checkEmailInUser.id);
    }

    if (checkEmailProvider) {
      await this.usersRepo.createUserProvider(
        this.getProviderDto(githubId, login, email, checkEmailProvider.userId),
      );
      return this.loginUser(ip, device, checkEmailProvider.userId);
    }
  }

  private async handleExistingGithubUser(
    githubId: string,
    email: string,
    ip: string,
    device: string,
  ): Promise<{ accessToken: string } | null> {
    const githubProviderData =
      await this.usersRepo.findDataByGithubId(githubId);
    if (!githubProviderData) return null;

    const existingUser = await this.usersRepo.findByEmail(email);
    if (!existingUser) {
      await this.usersRepo.updateEmailInUserProvider(githubId, email);
      return this.loginUser(ip, device, githubProviderData.userId);
    }
    return this.loginUser(ip, device, existingUser.id);
  }

  private async loginUser(
    ip: string,
    device: string,
    userId: string,
  ): Promise<{ accessToken: string }> {
    return this.commandBus.execute(
      new LoginUserCommand({
        ip,
        device,
        userId,
      }),
    );
  }

  private async generateUniqueLogin(baseLogin: string): Promise<string> {
    const isLoginTaken = await this.usersRepo.findByLogin(baseLogin);
    if (!isLoginTaken) {
      return baseLogin;
    }
    this.logger.log(`Login "${baseLogin}" is taken, generating unique login`);
    return this.loginGenerateService.generateUniqueLogin(baseLogin);
  }

  getProviderDto(
    providerUserId: string,
    login: string,
    email: string,
    userId: string,
  ) {
    return {
      provider: 'github',
      providerUserId,
      login,
      email,
      userId,
    };
  }
  getUserDto(email: string, login: string, passwordHash: string | null = null) {
    return {
      email,
      login,
      passwordHash,
    };
  }
}
