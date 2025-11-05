import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { FilesApiController } from './files-api.controller';
import { FilesApiService } from './files-api.service';
import { envFilePaths } from './env-file-paths';
import { validate } from './core/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFilePaths,
      validate,
    }),
  ],
  controllers: [FilesApiController],
  providers: [FilesApiService],
})
export class FilesApiModule {}
