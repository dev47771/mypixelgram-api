import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { validate } from './core/env.validation';
import { envFilePaths } from './env-file-paths';
import { CqrsModule } from '@nestjs/cqrs';
import { FilesUploadUseCase } from './files/application/use-cases/files-upload.use-case';
import { S3StorageAdapter } from './core/s3storageAdapter';
import { DeleteFilesUseCase } from './files/application/use-cases/delete-file.use-case';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSchema } from './files/domain/file.schema';
import { FilesRepo } from './files/infrastructure/files.repo';
import { FilesApiController } from './files/api/files-api.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFilePaths,
      validate,
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: `${configService.get('MONGO_URL')}/${configService.get('DB_NAME')}`,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    ScheduleModule.forRoot(),
    CqrsModule,
  ],
  controllers: [FilesApiController],
  providers: [
    FilesRepo,
    FilesUploadUseCase,
    S3StorageAdapter,
    DeleteFilesUseCase,
    {
      provide: S3StorageAdapter,
      useFactory: (configService: ConfigService) => {
        return new S3StorageAdapter(configService);
      },
      inject: [ConfigService],
    },
  ],
})
export class FilesApiModule {}
