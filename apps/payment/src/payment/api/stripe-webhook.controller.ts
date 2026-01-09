import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeWebhookService } from '../application/stripe-webhook.service';

@Controller('stripe')
export class StripeWebhookController {
  constructor(private readonly webhookService: StripeWebhookService) {}

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      await this.webhookService.handle(req);
      return res.status(HttpStatus.OK).send({ received: true });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
  }
}
