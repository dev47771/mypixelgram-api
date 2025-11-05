import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(@Inject('FILES_API') private readonly filesApiClient: ClientProxy) {}

  async testFilesMicroservice(data: any): Promise<any> {
    return this.filesApiClient.send({ cmd: 'test' }, data);
  }
}
