import { HttpStatus, INestApplication } from '@nestjs/common';
import { GLOBAL_PREFIX } from '../../../../src/setup/global-prefix.setup';
import { AUTH_ROUTE } from '../../../../src/modules/user-accounts/api/auth.controller';
import type { Response } from 'supertest';
import * as request from 'supertest';

export const buildAuthPath = (actionPath: string): string => {
  return `/${GLOBAL_PREFIX}/${AUTH_ROUTE}/${actionPath}`;
};

export class AuthTestManager {
  constructor(private app: INestApplication) {}

  async register(
    inputDto: any,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(buildAuthPath('register'))
      .send(inputDto)
      .expect(expectedStatusCode);
  }
}
