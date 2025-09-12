import { Module } from '@nestjs/common';
import { FilesApiController } from './files-api.controller';
import { FilesApiService } from './files-api.service';

@Module({
  imports: [],
  controllers: [FilesApiController],
  providers: [FilesApiService],
})
export class FilesApiModule {}
