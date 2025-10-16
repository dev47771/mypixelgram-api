import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users.repo';
import { ConfigService } from '@nestjs/config';
import { GithubInputDto } from '../../api/input-dto/githubInputDto';
import { LoginUserCommand } from './login-user.use-case';
import { LoginGenerateService } from '../login.generate.service';

export class GithubRegisterUseCaseCommand {
  constructor(public dto: GithubInputDto) {}
}

@CommandHandler(GithubRegisterUseCaseCommand)
export class GithubRegisterUseCase
  implements ICommandHandler<GithubRegisterUseCaseCommand>
{
  constructor(
    private usersRepo: UsersRepo,
    protected configService: ConfigService,
    protected commandBus: CommandBus,
    protected loginGenerateService: LoginGenerateService,
  ) {}

  async execute(
    command: GithubRegisterUseCaseCommand,
  ): Promise<{ accessToken: string }> {
    const { githubId, email, ip, device, login } = command.dto;

    const githubUser = await this.usersRepo.findByGithubId(githubId);

    if (githubUser) {
      //---- user с таким githubId уже есть в нашей системе
      const userProvider = await this.usersRepo.checkEmailInUserProvider(email);
      if (!userProvider) {
        //---- user с таким githubId есть в системе но email отличается, меняем обновляем email и выдаем токены
        await this.usersRepo.updateEmailInUserProvider(githubId, email);
        return await this.commandBus.execute(
          new LoginUserCommand(this.getLoginDto(ip, device, githubUser.userId)),
        );
      }
      return await this.commandBus.execute(
        new LoginUserCommand(this.getLoginDto(ip, device, userProvider.userId)),
      );
    }
    //----
    const userProvider = await this.usersRepo.checkEmailInUserProvider(email);
    const user = await this.usersRepo.findByEmail(email);

    if (!user && !userProvider) {
      let newLogin: string = login;
      const checkLogin = await this.usersRepo.findByLogin(login);
      if (checkLogin) {
        newLogin = await this.loginGenerateService.generateUniqueLogin(login);
      }

      const createUser = await this.usersRepo.createUser(
        this.getUserDto(email, newLogin),
      );
      await this.usersRepo.createUserProvider(
        this.getUserProviderDto(
          githubId,
          createUser.login,
          createUser.email,
          createUser.id,
        ),
      );

      return await this.commandBus.execute(
        new LoginUserCommand(this.getLoginDto(ip, device, createUser.id)),
      );
    }

    //---- user c таким email есть в нашей системе создаем только учетную запись в user-provider и выдаем токены
    const foundUser = await this.usersRepo.findByEmail(email);
    await this.usersRepo.createUserProvider(
      this.getUserProviderDto(githubId, login, email, foundUser!.id),
    );

    return await this.commandBus.execute(
      new LoginUserCommand(this.getLoginDto(ip, device, foundUser!.id)),
    );
  }

  getLoginDto(ip: string, device: string, userId: string) {
    return {
      ip: ip,
      device: device,
      userId: userId,
    };
  }

  getUserProviderDto(
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
