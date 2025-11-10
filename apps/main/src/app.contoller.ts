import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('test-files')
  async testFilesMicroservice() {
    return this.appService.testFilesMicroservice({ message: 'Проверка связи!' });
  }
}
