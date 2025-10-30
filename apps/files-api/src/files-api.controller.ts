import { Controller, Get } from '@nestjs/common';
import { FilesApiService } from './files-api.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class FilesApiController {
  constructor(private readonly filesApiService: FilesApiService) {}

  @Get()
  getHello(): string {
    return this.filesApiService.getHello();
  }

  @MessagePattern({ cmd: 'test' })
  test(data: any) {
    console.log('TCP тест получен:', data);
    return { status: 'ok', received: data };
  }
}
