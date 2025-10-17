import {
  GithubRegisterUseCase,
  GithubRegisterUseCaseCommand,
} from '../../../../src/modules/user-accounts/application/usecases/github-authorization.use-case';
import { UsersRepo } from '../../../../src/modules/user-accounts/infrastructure/users.repo';
import { CommandBus } from '@nestjs/cqrs';
import { LoginGenerateService } from '../../../../src/modules/user-accounts/application/login.generate.service';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { LoginUserCommand } from '../../../../src/modules/user-accounts/application/usecases/login-user.use-case';

const mockGithubId = 'github-123';
const mockEmail = 'test@example.com';
const mockIp = '127.0.0.1';
const mockDevice = 'test-device';
const mockLogin = 'testuser';

const mockGithubInputDto = {
  githubId: mockGithubId,
  email: mockEmail,
  ip: mockIp,
  device: mockDevice,
  login: mockLogin,
};

describe('GithubRegisterUseCase', () => {
  let githubRegisterUseCase: GithubRegisterUseCase;
  let usersRepo: UsersRepo;
  let commandBus: CommandBus;
  let loginGenerateService: LoginGenerateService;

  const mockUsersRepo = {
    findDataByGithubId: jest.fn(),
    findByEmail: jest.fn(),
    updateEmailInUserProvider: jest.fn(),
    createUser: jest.fn(),
    createUserProvider: jest.fn(),
    findByLogin: jest.fn(),
    findProviderByEmail: jest.fn(),
  };

  const mockCommandBus = {
    execute: jest.fn(),
  };

  const mockLoginGenerateService = {
    generateUniqueLogin: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GithubRegisterUseCase,
        {
          provide: UsersRepo,
          useValue: mockUsersRepo,
        },
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
        {
          provide: LoginGenerateService,
          useValue: mockLoginGenerateService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    githubRegisterUseCase = moduleRef.get<GithubRegisterUseCase>(
      GithubRegisterUseCase,
    );
    usersRepo = moduleRef.get<UsersRepo>(UsersRepo);
    commandBus = moduleRef.get<CommandBus>(CommandBus);
    loginGenerateService =
      moduleRef.get<LoginGenerateService>(LoginGenerateService);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return access token when github user already exists with same email', async () => {
      const mockGithubProviderData = {
        userId: 'user-123',
        providerUserId: mockGithubId,
        email: mockEmail,
      };
      const mockUser = { id: 'user-123', email: mockEmail };

      mockUsersRepo.findDataByGithubId.mockResolvedValue(
        mockGithubProviderData,
      );
      mockUsersRepo.findByEmail.mockResolvedValue(mockUser);

      const mockToken = { accessToken: 'test-token' };
      mockCommandBus.execute.mockResolvedValue(mockToken);

      const result = await githubRegisterUseCase.execute(
        new GithubRegisterUseCaseCommand(mockGithubInputDto),
      );

      expect(usersRepo.findDataByGithubId).toHaveBeenCalledWith(mockGithubId);
      expect(usersRepo.findByEmail).toHaveBeenCalledWith(mockEmail);
      expect(usersRepo.updateEmailInUserProvider).not.toHaveBeenCalled();
      expect(commandBus.execute).toHaveBeenCalledWith(
        new LoginUserCommand({
          ip: mockIp,
          device: mockDevice,
          userId: mockUser.id,
        }),
      );
      expect(result).toEqual(mockToken);
    });
    it('should update email and return token when github user exists but email differs', async () => {
      const mockGithubProviderData = {
        userId: 'user-123',
        providerUserId: mockGithubId,
        email: 'old@example.com', // Different email
      };

      mockUsersRepo.findDataByGithubId.mockResolvedValue(
        mockGithubProviderData,
      );
      mockUsersRepo.findByEmail.mockResolvedValue(null); // No user with new email

      const mockToken = { accessToken: 'test-token' };
      mockCommandBus.execute.mockResolvedValue(mockToken);

      const result = await githubRegisterUseCase.execute(
        new GithubRegisterUseCaseCommand(mockGithubInputDto),
      );

      expect(usersRepo.findDataByGithubId).toHaveBeenCalledWith(mockGithubId);
      expect(usersRepo.findByEmail).toHaveBeenCalledWith(mockEmail);
      expect(usersRepo.updateEmailInUserProvider).toHaveBeenCalledWith(
        mockGithubId,
        mockEmail,
      );
      expect(commandBus.execute).toHaveBeenCalledWith(
        new LoginUserCommand({
          ip: mockIp,
          device: mockDevice,
          userId: mockGithubProviderData.userId,
        }),
      );
      expect(result).toEqual(mockToken);
    });

    it('should create new user and provider when no existing data found', async () => {
      mockUsersRepo.findDataByGithubId.mockResolvedValue(null);
      mockUsersRepo.findByEmail.mockResolvedValue(null);
      mockUsersRepo.findProviderByEmail.mockResolvedValue(null);
      mockUsersRepo.findByLogin.mockResolvedValue(null); // Login is available

      const mockNewUser = {
        id: 'new-user-123',
        email: mockEmail,
        login: mockLogin,
      };
      mockUsersRepo.createUser.mockResolvedValue(mockNewUser);
      mockUsersRepo.createUserProvider.mockResolvedValue({});

      const mockToken = { accessToken: 'new-user-token' };
      mockCommandBus.execute.mockResolvedValue(mockToken);

      const result = await githubRegisterUseCase.execute(
        new GithubRegisterUseCaseCommand(mockGithubInputDto),
      );

      expect(usersRepo.findDataByGithubId).toHaveBeenCalledWith(mockGithubId);
      expect(usersRepo.findByEmail).toHaveBeenCalledWith(mockEmail);
      expect(usersRepo.findProviderByEmail).toHaveBeenCalledWith(mockEmail);
      expect(usersRepo.findByLogin).toHaveBeenCalledWith(mockLogin);
      expect(usersRepo.createUser).toHaveBeenCalledWith({
        email: mockEmail,
        login: mockLogin,
        passwordHash: null,
      });
      expect(usersRepo.createUserProvider).toHaveBeenCalledWith({
        provider: 'github',
        providerUserId: mockGithubId,
        login: mockLogin,
        email: mockEmail,
        userId: mockNewUser.id,
      });
      expect(commandBus.execute).toHaveBeenCalledWith(
        new LoginUserCommand({
          ip: mockIp,
          device: mockDevice,
          userId: mockNewUser.id,
        }),
      );
      expect(result).toEqual(mockToken);
    });
  });
});
