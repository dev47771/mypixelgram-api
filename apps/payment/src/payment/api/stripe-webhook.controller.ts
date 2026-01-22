import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeWebhookService } from '../application/stripe-webhook.service';

@Controller('stripe')
export class StripeWebhookController {
  constructor(private readonly webhookService: StripeWebhookService) {}

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    console.log('[WEBHOOK] Incoming headers:', req.headers);
    console.log('[WEBHOOK] Raw body:', req.body?.toString()); // Buffer -> string
    console.log('[WEBHOOK] Stripe event type:', req.body?.type);

    try {
      const result = await this.webhookService.handle(req);
      console.log('[WEBHOOK] Handle success:', result);
      return res.status(HttpStatus.OK).send({ received: true });
    } catch (e) {
      console.error('[WEBHOOK ERROR]', e);
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
  }
}
