import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users.repo';
import { ConfigService } from '@nestjs/config';
import { GithubInputDto } from '../../api/input-dto/githubInputDto';
import { LoginUserCommand } from './login-user.use-case';
import { ExtractDeviceAndIpDto } from '../../api/input-dto/extract-device-ip.input-dto';
import { CreateUserRepoDto } from '../../infrastructure/dto/create-user.repo-dto';
import { UserProviderInputDto } from '../../api/input-dto/user.provider.dto';

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
  ) {}

  async execute(command: GithubRegisterUseCaseCommand) {
    const { githubId, email, ip, device, login } = command.dto;

    const githubUser = await this.usersRepo.findByGithubId(githubId);

    if (githubUser) {
      //---- user с таким githubId уже есть в нашей системе
      const userProvider = await this.usersRepo.checkEmailInUserProvider(email);

      if (!userProvider) {
        //---- user с таким githubId есть в системе но email отличается, меняем обновляем emaik и выдаем токены
        await this.usersRepo.updateEmailInUserProvider(githubId, email); // обновляем почту
        // выдаем токены
        const loginDto: ExtractDeviceAndIpDto = {
          ip: ip,
          device: device,
          userId: userProvider!.userId,
        };
        return await this.commandBus.execute(new LoginUserCommand(loginDto));
      }
      //---- user c таким githubId есть в системе и email сходится, выдаем токены
      const loginDto: ExtractDeviceAndIpDto = {
        ip: ip,
        device: device,
        userId: userProvider.userId,
      };
      return await this.commandBus.execute(new LoginUserCommand(loginDto));
    }

    const userProvider = await this.usersRepo.checkEmailInUserProvider(email);

    const user = await this.usersRepo.findByEmail(email);

    if (!user && !userProvider) {
      const userDto: CreateUserRepoDto = {
        email: email,
        login: login,
        passwordHash: null,
      };

      try {
        const createUser = await this.usersRepo.createUser(userDto);

        const userProviderDto: UserProviderInputDto = {
          provider: 'github',
          providerUserId: githubId,
          login: createUser.login,
          email: createUser.email,
          userId: createUser.id,
        };

        const createUserProvider =
          await this.usersRepo.createUserProvider(userProviderDto);

        const loginDto = {
          ip: ip,
          device: device,
          userId: createUser.id,
        };

        return await this.commandBus.execute(new LoginUserCommand(loginDto));
      } catch (e) {
        console.error(e);
      }
    }

    //---- user c таким email есть в нашей системе создаем только учетную запись в user-provider и выдаем токены
  }
}
