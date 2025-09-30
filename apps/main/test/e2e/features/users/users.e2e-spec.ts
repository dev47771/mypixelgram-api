import { initApp } from '../../helpers/app';
import { INestApplication } from '@nestjs/common';
import { UsersTestRepo } from './users.test-repo';
import { PrismaService } from '../../../../src/core/prisma/prisma.service';
import { deleteAllData } from '../../helpers/delete-all-data';

describe('users', () => {
  let app: INestApplication;
  let usersTestRepo: UsersTestRepo;

  beforeAll(async () => {
    app = await initApp();

    const prisma = app.get(PrismaService);
    usersTestRepo = new UsersTestRepo(prisma);
  });

  afterAll(async () => {
    await deleteAllData(app);
    await app.close();
  });

  describe('create user', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should create user', async () => {
      // await request(app.getHttpServer())
      //   .post('/api/users')
      //   .auth('admin', 'qwerty')
      //   .send({
      //     correctUser,
      //   })
      //   .expect(HttpStatus.CREATED);
    });
    it('return 400 data incorrect', async () => {});
  });

  describe('get user', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should return user', async () => {});
    it('should return 404 if user id is not a number', async () => {});
  });
});
