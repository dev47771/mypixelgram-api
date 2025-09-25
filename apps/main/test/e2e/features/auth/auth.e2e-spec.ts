import { initApp } from '../../helpers/app';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersTestRepo } from '../users/users.test-repo';
import { PrismaService } from '../../../../src/core/prisma/prisma.service';
import { deleteAllData } from '../../helpers/delete-all-data';
import { AuthTestManager } from './auth.test-manager';
import { EmailService } from '../../../../src/modules/notifications/email.service';
import { UserViewDto } from '../../../../src/modules/user-accounts/api/view-dto/user.view-dto';
//import { UsersTestManager } from '../users/users.test-manager';
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
import { correctUser } from '../../helpers/auth.helper';
import { response } from 'express';

describe('auth', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  //let usersTestManager: UsersTestManager;
  let usersTestRepo: UsersTestRepo;
  let configService: ConfigService;

  beforeAll(async () => {
    app = await initApp();

    authTestManager = new AuthTestManager(app);
    //usersTestManager = new UsersTestManager(app);

    const prisma = app.get(PrismaService);
    usersTestRepo = new UsersTestRepo(prisma);
    configService = app.get(ConfigService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('register', () => {
    it('should register success', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(correctUser)
        .expect(HttpStatus.NO_CONTENT);

      const response = await authTestManager.login(correctUser); //login user
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
      await authTestManager.register(correctUser); // register user

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
      await authTestManager.register(correctUser); // register user
      const response = await authTestManager.login(correctUser); //login user

      const token = response.body.accessToken;

      const user = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(user.body.login).toEqual(correctUser.login);

      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Cookie', response.headers['set-cookie'][0])
        .expect(HttpStatus.NO_CONTENT);
    });
    it('400 Unauthorized', async () => {
      await authTestManager.register(correctUser); // register user
      await authTestManager.login(correctUser); //login user

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
});
