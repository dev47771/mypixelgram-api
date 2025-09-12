import { Controller, Get } from '@nestjs/common';
import { FilesApiService } from './files-api.service';

@Controller()
export class FilesApiController {
  constructor(private readonly filesApiService: FilesApiService) {}

  @Get()
  getHello(): string {
    return this.filesApiService.getHello();
  }
}
