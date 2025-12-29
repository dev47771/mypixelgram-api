import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class PaymentApiController {
  @MessagePattern({ cmd: 'ping' })
  async ping(data: string) {
    console.log('[PAYMENT] PING RECEIVED:', data);
    return 'pong from payment-api';
  }
}
