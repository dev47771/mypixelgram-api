import { initApp } from '../../helpers/app';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersTestRepo } from '../users/users.test-repo';
import { PrismaService } from '../../../../src/core/prisma/prisma.service';
import { deleteAllData } from '../../helpers/delete-all-data';
import { AuthTestManager } from './auth.test-manager';
import { EmailService } from '../../../../src/modules/notifications/email.service';
import { UserViewDto } from '../../../../src/modules/user-accounts/api/view-dto/user.view-dto';
import { UsersTestManager } from '../users/users.test-manager';
import {
  getInvalidEmailCases,
  getInvalidLoginCases,
  getInvalidPasswordCases,
  makeValidUserInput,
} from '../../helpers/fixtures/user-inputs';
import { CreateUserInputDto } from '../../../../src/modules/user-accounts/api/input-dto/create-user.input-dto';
import { UserConfirmation as UserConfirmationModel } from '.prisma/client';
import { expectValidCreatedUser } from '../../helpers/user-assertions';
import type { Response } from 'supertest';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

describe('auth', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  let usersTestManager: UsersTestManager;
  let usersTestRepo: UsersTestRepo;
  let configService: ConfigService;

  beforeAll(async () => {
    app = await initApp();

    authTestManager = new AuthTestManager(app);
    usersTestManager = new UsersTestManager(app);

    const prisma = app.get(PrismaService);
    usersTestRepo = new UsersTestRepo(prisma);
    configService = app.get(ConfigService);
  });

  afterAll(async () => {
    // await deleteAllData(app);
    await app.close();
  });

  describe('register', () => {
    let emailService: EmailService;

    beforeAll(async () => {
      emailService = app.get(EmailService);
    });

    beforeEach(async () => {
      (emailService.sendConfirmationEmail as jest.Mock).mockClear();
    });

    describe('success', () => {
      beforeAll(async () => {
        await deleteAllData(app);
      });

      it('should register user', async () => {
        const inputDto: CreateUserInputDto = makeValidUserInput();

        const response = await authTestManager.register(
          inputDto,
          HttpStatus.CREATED,
        );
        const registeredUser: UserViewDto = response.body;

        expectValidCreatedUser(registeredUser, inputDto);

        const dbConfirmationInfo: UserConfirmationModel =
          await usersTestRepo.findUserConfirmationInfo(registeredUser.id);
        expect(dbConfirmationInfo.isConfirmed).toBe(false);
        expect(dbConfirmationInfo.confirmationCode).toEqual(expect.any(String));
        expect(dbConfirmationInfo.expirationDate).toEqual(expect.any(Date));

        const retrievedUser = await usersTestManager.getUserSuccess(
          registeredUser.id,
        );
        expect(retrievedUser).toEqual(registeredUser);

        expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(1);
      });
    });
    describe('validation', () => {
      let existingUser: UserViewDto;

      beforeAll(async () => {
        await deleteAllData(app);

        const takenUserInput = makeValidUserInput({
          login: 'takenUsername',
          email: 'takenUsername@example.com',
        });
        existingUser = await usersTestManager.createUserSuccess(takenUserInput);
      });

      afterEach(async () => {
        await usersTestRepo.assertUsersCount(1);

        expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(0);
      });

      it('should return 400 if login is invalid', async () => {
        for (const invalidInput of getInvalidLoginCases(existingUser.login)) {
          const response = await authTestManager.register(
            invalidInput,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'login',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return 400 if email is invalid', async () => {
        for (const invalidInput of getInvalidEmailCases(existingUser.email)) {
          const response = await authTestManager.register(
            invalidInput,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'email',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return 400 if password is invalid', async () => {
        for (const invalidInput of getInvalidPasswordCases()) {
          const response = await authTestManager.register(
            invalidInput,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              { field: 'password', message: expect.any(String) },
            ],
          });
        }
      });

      it('should return multiple errors if multiple fields are invalid', async () => {
        const invalidInput = {
          login: '',
          email: 'without domain',
        };

        const response = await authTestManager.register(
          invalidInput,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: expect.arrayContaining([
            {
              field: 'login',
              message: expect.any(String),
            },
            {
              field: 'email',
              message: expect.any(String),
            },
            {
              field: 'password',
              message: expect.any(String),
            },
          ]),
        });
        expect(response.body.errorsMessages).toHaveLength(3);
      });
    });
  });

  describe('login', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should login success', async () => {
      const userDto = {
        login: 'takyUnamexx',
        email: 'tak9087@mail.ru',
        password: 'take22Dn',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(userDto)
        .expect(HttpStatus.NO_CONTENT);

      const loginUser = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('user-agent', 'Chrome')
        .send({
          email: userDto.email,
          password: userDto.password,
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

      expect(userDto.login).toEqual(user.body.login);
      expect(userDto.email).toEqual(user.body.email);
    });
    it('400 BadRequest validation', async () => {
      const userDto = {
        login: 'takyUnamexxx',
        email: 'tak90877@mail.ru',
        password: 'take22Dnn',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(userDto)
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('user-agent', 'Chrome')
        .send({
          email: userDto.email,
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
      const userDto = {
        login: 'tyUnamexxx',
        email: 't90877@mail.ru',
        password: 'tak22Dnn',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(userDto)
        .expect(HttpStatus.NO_CONTENT);

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
});
