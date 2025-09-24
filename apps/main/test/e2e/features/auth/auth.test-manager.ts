import { HttpStatus, INestApplication } from '@nestjs/common';
import { GLOBAL_PREFIX } from '../../../../src/setup/global-prefix.setup';
import type { Response } from 'supertest';
import * as request from 'supertest';
import { AUTH_ROUTE } from '../../../../src/modules/user-accounts/domain/constants';
import { CreateUserInputDto } from '../../../../src/modules/user-accounts/api/input-dto/create-user.input-dto';
import { correctUser } from '../../helpers/auth.helper';

export const buildAuthPath = (actionPath: string): string => {
  return `/${GLOBAL_PREFIX}/${AUTH_ROUTE}/${actionPath}`;
};

export class AuthTestManager {
  constructor(private app: INestApplication) {}

  async register(userDto: CreateUserInputDto) {
    return await request(this.app.getHttpServer())
      .post('/api/auth/register')
      .send(userDto)
      .expect(HttpStatus.NO_CONTENT);
  }

  async login(userDto: CreateUserInputDto) {
    return await request(this.app.getHttpServer())
      .post('/api/auth/login')
      .set('user-agent', 'Chrome')
      .send({
        email: userDto.email,
        password: userDto.password,
      })
      .expect(HttpStatus.OK);
  }
}
