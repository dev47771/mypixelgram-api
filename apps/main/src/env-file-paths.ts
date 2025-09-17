import { join } from 'node:path';
import * as process from 'node:process';

const serviceRoot = join(__dirname, '..', '..', '..', 'apps', 'main', 'src', 'env',);

export const envFilePaths = [
  process.env.ENV_FILE_PATH?.trim() || '',
  join(serviceRoot, `.env.${process.env.NODE_ENV}.local`),
  join(serviceRoot, `.env.${process.env.NODE_ENV}`),
  join(serviceRoot, `.env`),
];
