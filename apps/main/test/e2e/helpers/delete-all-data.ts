import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import type { Response } from 'supertest';
import { TESTING_ROUTE } from '../../../src/modules/testing/testing.controller';
import { GLOBAL_PREFIX } from '../../../src/setup/global-prefix.setup';

export const deleteAllData = async (
  app: INestApplication,
): Promise<Response> => {
  return request(app.getHttpServer()).delete(
    `/${GLOBAL_PREFIX}/${TESTING_ROUTE}/all-data`,
  );
};
