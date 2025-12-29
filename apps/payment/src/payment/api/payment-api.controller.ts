import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class PaymentApiController {
  @MessagePattern({ cmd: 'ping' })
  async ping(data: string) {
    console.log('PING RECEIVED:', data);
    return 'pong from files-api 🚀';
  }
}
