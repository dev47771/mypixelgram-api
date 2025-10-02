import { initApp } from '../../helpers/app';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersTestRepo } from '../users/users.test-repo';
import { PrismaService } from '../../../../src/core/prisma/prisma.service';
import { deleteAllData } from '../../helpers/delete-all-data';
import { AuthTestManager } from './auth.test-manager';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { correctUser, delay } from '../../helpers/auth.helper';
import { generateConfirmationCode } from '../../../../src/modules/user-accounts/application/usecases/common/confirmationCode.helper';

jest.mock(
  '../../../../src/modules/user-accounts/application/usecases/common/confirmationCode.helper',
  () => ({
    generateConfirmationCode: jest.fn(),
  }),
);

describe('auth', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  let usersTestRepo: UsersTestRepo;
  let configService: ConfigService;

  beforeAll(async () => {
    app = await initApp();
    authTestManager = new AuthTestManager(app);

    const prisma = app.get(PrismaService);
    usersTestRepo = new UsersTestRepo(prisma);
    configService = app.get(ConfigService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('register', () => {
    // beforeEach(async () => {
    //   await deleteAllData(app);
    // });

    const mockCode = 'c9df3dfc-5c0f-446a-9500-bd747c611111';
    (generateConfirmationCode as jest.Mock).mockReturnValueOnce(mockCode);

    it('should register, confirmation, login success', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(correctUser)
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .post('/api/auth/registration-confirmation')
        .send({
          code: mockCode,
        })
        .expect(HttpStatus.NO_CONTENT);

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('user-agent', 'Chrome')
        .send({
          email: correctUser.email,
          password: correctUser.password,
        })
        .expect(HttpStatus.OK);

      const token = response.body.accessToken;

      const user = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(user.body.login).toEqual(correctUser.login);
      expect(user.body.email).toEqual(correctUser.email);
    });
    it('400 BadRequest validation', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          login: '', // incorrect login
          email: 'user-test@mail.ru',
          password: 'pasS1234',
        })
        .expect(HttpStatus.BAD_REQUEST);

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          login: 1112, // incorrect login
          email: 'user-test@mail.ru',
          password: 'pasS1234',
        })
        .expect(HttpStatus.BAD_REQUEST);

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          login: 'user-test',
          email: 'user-testmail.ru', // incorrect email
          password: 'pasS1234',
        })
        .expect(HttpStatus.BAD_REQUEST);

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          login: 'user-test',
          email: 'user-test@mail.ru',
          password: 'pas234', // incorrect password
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
  describe('login', () => {
    beforeEach(async () => {
      await deleteAllData(app);
    });

    it('should login success', async () => {
      const mockCode = 'c9df3dfc-5c0f-446a-9500-bd747c611111';
      (generateConfirmationCode as jest.Mock).mockReturnValueOnce(mockCode);

      await authTestManager.register(correctUser); // register user

      await request(app.getHttpServer())
        .post('/api/auth/registration-confirmation')
        .send({
          code: mockCode,
        })
        .expect(HttpStatus.NO_CONTENT);

      const loginUser = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('user-agent', 'Chrome')
        .send({
          email: correctUser.email,
          password: correctUser.password,
        })
        .expect(HttpStatus.OK);

      const payloadToken = loginUser.body.accessToken;

      const token = jwt.verify(
        payloadToken,
        configService.get('JWT_SECRET_KEY')!,
      ) as { userId: string; deviceId: string; iat: number; exp: number };

      const user = await request(app.getHttpServer())
        .get(`/api/users/${token.userId}`)
        .auth(
          configService.get('HTTP_BASIC_USER')!,
          configService.get('HTTP_BASIC_PASS')!,
        )
        .expect(HttpStatus.OK);

      expect(correctUser.login).toEqual(user.body.login);
      expect(correctUser.email).toEqual(user.body.email);
    });
    it('400 BadRequest validation', async () => {
      await authTestManager.register(correctUser); // register user

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('user-agent', 'Chrome')
        .send({
          email: correctUser.email,
          password: '123456', // incorrect password
        })
        .expect(HttpStatus.BAD_REQUEST);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('user-agent', 'Chrome')
        .send({
          email: 'xxxgmail.ru', // incorrect email
          password: 'take22Dnn',
        })
        .expect(HttpStatus.BAD_REQUEST);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('user-agent', 'Chrome')
        .send({
          email: 12344, // incorrect email
          password: 'take22Dnn',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('401 Unauthorized validation', async () => {
      await authTestManager.register(correctUser); // register user

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('user-agent', 'Chrome')
        .send({
          email: 'xxxxxxxx@mail.ru', // not exists email
          password: 'tak22Dnn',
        })
        .expect(HttpStatus.UNAUTHORIZED);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('user-agent', 'Chrome')
        .send({
          email: 't90877@mail.ru',
          password: 'tak22Dnnxxxx', // incorrect password
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
  describe('logout', () => {
    beforeEach(async () => {
      await deleteAllData(app);
    });

    it('should logout success', async () => {
      const mockCode = 'c9df3dfc-5c0f-446a-9500-bd747c611111';
      (generateConfirmationCode as jest.Mock).mockReturnValueOnce(mockCode);

      await authTestManager.register(correctUser); // register user

      await request(app.getHttpServer())
        .post('/api/auth/registration-confirmation')
        .send({
          code: mockCode,
        })
        .expect(HttpStatus.NO_CONTENT);

      const result = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('user-agent', 'Chrome')
        .send({
          email: correctUser.email,
          password: correctUser.password,
        })
        .expect(HttpStatus.OK);

      const token = result.body.accessToken;

      const user = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(user.body.login).toEqual(correctUser.login);

      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Cookie', result.headers['set-cookie'][0])
        .expect(HttpStatus.NO_CONTENT);
    });
    it('400 Unauthorized', async () => {
      const mockCode = 'c9df3dfc-5c0f-446a-9500-bd747c611111';
      (generateConfirmationCode as jest.Mock).mockReturnValueOnce(mockCode);

      await authTestManager.register(correctUser); // register user

      await request(app.getHttpServer())
        .post('/api/auth/registration-confirmation')
        .send({
          code: mockCode,
        })
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('user-agent', 'Chrome')
        .send({
          email: correctUser.email,
          password: correctUser.password,
        })
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Cookie', '') // not token
        .expect(HttpStatus.UNAUTHORIZED);

      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Cookie', '') // not refresh token
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
  describe('confirmation', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should confirmation success', async () => {
      const mockCode = 'c9df3dfc-5c0f-446a-9500-bd747c611111';
      (generateConfirmationCode as jest.Mock).mockReturnValueOnce(mockCode);

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(correctUser)
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .post('/api/auth/registration-confirmation')
        .send({
          code: mockCode,
        })
        .expect(HttpStatus.NO_CONTENT);
    });
  });
  describe('recovery-password', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should recovery-password success', async () => {
      const mockCode = 'c9df3dfc-5c0f-446a-9500-bd747c611111';
      (generateConfirmationCode as jest.Mock).mockReturnValue(mockCode);

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(correctUser)
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .post('/api/auth/registration-confirmation')
        .send({
          code: mockCode,
        })
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .post('/api/auth/recover-password')
        .send({
          email: correctUser.email,
        })
        .expect(HttpStatus.NO_CONTENT);
    });
  });
  describe('new-password', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should new-password success', async () => {
      const mockCode1 = 'c9df3dfc-5c0f-446a-9500-bd747c611111';
      const mockCode2 = 'c9df3dfc-5c0f-446a-9500-bd747c611112';
      (generateConfirmationCode as jest.Mock)
        .mockReturnValueOnce(mockCode1)
        .mockReturnValueOnce(mockCode2);

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(correctUser)
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .post('/api/auth/registration-confirmation')
        .send({
          code: mockCode1,
        })
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .post('/api/auth/recover-password')
        .send({
          email: correctUser.email,
        })
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .post('/api/auth/new-password')
        .send({
          newPassword: '12sgKLbc',
          recoveryCode: mockCode2,
        })
        .expect(HttpStatus.NO_CONTENT);
    });
  });
  describe('check-recovery-code', () => {
    beforeEach(async () => {
      await deleteAllData(app);
    });

    const mockCode = 'c9df3dfc-5c0f-446a-9500-bd747c611111';
    (generateConfirmationCode as jest.Mock).mockReturnValueOnce(mockCode);

    it('should return 200 OK ', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(correctUser)
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .post('/api/auth/check-recovery-code')
        .send({
          code: mockCode,
        })
        .expect(HttpStatus.OK);
    });

    it('should return 400 Bad request ', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(correctUser)
        .expect(HttpStatus.NO_CONTENT);

      await delay(4000);

      await request(app.getHttpServer())
        .post('/api/auth/check-recovery-code')
        .send({
          code: mockCode,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
