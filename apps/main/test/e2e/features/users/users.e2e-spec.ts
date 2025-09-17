import { initApp } from '../../helpers/app';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersTestManager } from './users.test-manager';
import { UsersTestRepo } from './users.test-repo';
import { PrismaService } from '../../../../src/core/prisma/prisma.service';
import { deleteAllData } from '../../helpers/delete-all-data';
import { CreateUserInputDto } from '../../../../src/modules/user-accounts/api/input-dto/create-user.input-dto';
import { UserViewDto } from '../../../../src/modules/user-accounts/api/view-dto/user.view-dto';
import { UserConfirmation as UserConfirmationModel } from '@prisma/client';
import { invalidBasicAuthHeaders } from '../../helpers/fixtures/auth-invalid-values';
import {
  getInvalidEmailCases,
  getInvalidLoginCases,
  getInvalidPasswordCases,
  makeValidUserInput,
} from '../../helpers/fixtures/user-inputs';
import { expectValidCreatedUser } from '../../helpers/user-assertions';
import { INVALID_ID, NON_EXISTING_ID } from '../../helpers/fixtures/ids';

describe('users', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;
  let usersTestRepo: UsersTestRepo;

  beforeAll(async () => {
    app = await initApp();

    usersTestManager = new UsersTestManager(app);

    const prisma = app.get(PrismaService);
    usersTestRepo = new UsersTestRepo(prisma);
  });

  afterAll(async () => {
    await deleteAllData(app);
    await app.close();
  });

  describe('create user', () => {
    describe('success', () => {
      beforeAll(async () => {
        await deleteAllData(app);
      });

      it('should create user', async () => {
        const inputDto: CreateUserInputDto = makeValidUserInput();

        const response = await usersTestManager.createUser(
          inputDto,
          HttpStatus.CREATED,
        );
        const createdUser: UserViewDto = response.body;

        expectValidCreatedUser(createdUser, inputDto);

        const dbConfirmationInfo: UserConfirmationModel =
          await usersTestRepo.findUserConfirmationInfo(createdUser.id);
        expect(dbConfirmationInfo.isConfirmed).toBe(true);
        expect(dbConfirmationInfo.confirmationCode).toBeNull();
        expect(dbConfirmationInfo.expirationDate).toBeNull();

        const retrievedUser = await usersTestManager.getUserSuccess(
          createdUser.id,
        );
        expect(retrievedUser).toEqual(createdUser);
      });
    });

    describe('authentication', () => {
      beforeAll(async () => {
        await deleteAllData(app);
      });

      afterEach(async () => {
        await usersTestRepo.assertUsersCount(0);
      });

      it('should forbid creating user for non-admin users', async () => {
        for (const invalidAuthHeader of invalidBasicAuthHeaders) {
          await usersTestManager.createUser(
            makeValidUserInput(),
            HttpStatus.UNAUTHORIZED,
            invalidAuthHeader,
          );
        }
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
        const createUserResponse = await usersTestManager.createUser(
          takenUserInput,
          HttpStatus.CREATED,
        );
        existingUser = createUserResponse.body;
      });

      afterEach(async () => {
        await usersTestRepo.assertUsersCount(1);
      });

      it('should return 400 if login is invalid', async () => {
        for (const invalidInput of getInvalidLoginCases(existingUser.login)) {
          const response = await usersTestManager.createUser(
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
          const response = await usersTestManager.createUser(
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
          const response = await usersTestManager.createUser(
            invalidInput,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'password',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return multiple errors if multiple fields are invalid', async () => {
        const invalidInput = {
          login: '',
          email: 'without domain',
        };

        const response = await usersTestManager.createUser(
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

  describe('get user', () => {
    describe('success', () => {
      beforeAll(async () => {
        await deleteAllData(app);
      });

      it('should return user', async () => {
        const user =
          await usersTestManager.createUserSuccess(makeValidUserInput());

        const response = await usersTestManager.getUser(user.id, HttpStatus.OK);

        expect(response.body).toEqual({
          id: expect.any(String),
          login: expect.any(String),
          email: expect.any(String),
          createdAt: expect.any(String),
        });
        expect(response.body).toEqual(user);
      });
    });

    describe('not found', () => {
      beforeAll(async () => {
        await deleteAllData(app);
      });

      it('should return 404 if user id is not a number', async () => {
        await usersTestManager.getUser(INVALID_ID, HttpStatus.NOT_FOUND);
      });

      it('should return 404 if user does not exist', async () => {
        await usersTestManager.getUser(NON_EXISTING_ID, HttpStatus.NOT_FOUND);
      });
    });
  });
});
