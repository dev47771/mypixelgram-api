import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { FilesApiController } from './files-api.controller';
import { FilesApiService } from './files-api.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSchema } from './infrastructure/file.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL!),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  controllers: [FilesApiController],
  providers: [FilesApiService],
})
export class FilesApiModule {}
