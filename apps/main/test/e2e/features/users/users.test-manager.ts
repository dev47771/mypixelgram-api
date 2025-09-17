import { HttpStatus, INestApplication } from '@nestjs/common';
import type { Response } from 'supertest';
import * as request from 'supertest';
import { getAdminBasicAuthHeader } from '../../helpers/auth.helper';
import { USERS_ROUTE } from '../../../../src/modules/user-accounts/api/users.controller';
import { UserViewDto } from '../../../../src/modules/user-accounts/api/view-dto/user.view-dto';
import { GLOBAL_PREFIX } from '../../../../src/setup/global-prefix.setup';
import { CreateUserInputDto } from '../../../../src/modules/user-accounts/api/input-dto/create-user.input-dto';

function buildUsersPath(userId?: string): string {
  return `/${GLOBAL_PREFIX}/${USERS_ROUTE}${userId ? '/' + userId : ''}`;
}

export class UsersTestManager {
  constructor(private app: INestApplication) {}

  async createUser(
    inputDto: any,
    expectedStatusCode: HttpStatus,
    authHeader?: string,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(buildUsersPath())
      .set({ authorization: authHeader ?? getAdminBasicAuthHeader() })
      .send(inputDto)
      .expect(expectedStatusCode);
  }

  async createUserSuccess(inputDto: CreateUserInputDto): Promise<UserViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(buildUsersPath())
      .set({ authorization: getAdminBasicAuthHeader() })
      .send(inputDto)
      .expect(HttpStatus.CREATED);

    return response.body as UserViewDto;
  }

  async getUser(
    userId: string,
    expectedStatusCode: HttpStatus,
    authHeader?: string,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(buildUsersPath(userId))
      .set({ authorization: authHeader ?? getAdminBasicAuthHeader() })
      .expect(expectedStatusCode);
  }

  async getUserSuccess(userId: string): Promise<UserViewDto> {
    const response = await request(this.app.getHttpServer())
      .get(buildUsersPath(userId))
      .set({ authorization: getAdminBasicAuthHeader() })
      .expect(HttpStatus.OK);

    return response.body as UserViewDto;
  }
}
