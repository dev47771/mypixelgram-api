import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class FilesApiController {
  @MessagePattern({ cmd: 'filesUpload' })
  testFiles(data: any) {
    console.log('TCP тест получен:', data);
    return { status: 'ok', received: data };
  }
}
