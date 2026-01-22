import { Body, Controller, Delete, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { PAYMENT_ROUTE } from '../domain/constants';
import { TransportService } from '../../transport/transport.service';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-strategy/jwt-auth.guard';
import { CreateSubscriptionCheckoutDto } from './input-dto/create-subscription-checkout.input-dto';
import { CancelSubscriptionSwagger, CreateSubscriptionCheckoutSwagger, GetPaymentsSwagger, PaymentErrorSwagger, PaymentSuccessSwagger } from './decorators/payment-swagger.decorators';
import { CancelSubscriptionCommand } from '../application/usecases/cancel-subscription.usecase';
import { CommandBus } from '@nestjs/cqrs';

@Controller(PAYMENT_ROUTE)
export class PaymentController {
  constructor(
    private transport: TransportService,
    private commandBus: CommandBus,
  ) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('subscriptions/checkout')
  @CreateSubscriptionCheckoutSwagger()
  async createCheckout(@Body() dto: CreateSubscriptionCheckoutDto, @Req() req) {
    return this.transport.createSubscriptionCheckout({
      userId: req.user.id,
      planId: dto.planId,
    });
  }

  @Get('success')
  @PaymentSuccessSwagger()
  success(): string {
    return 'Great. You bought the best product. Check your products page';
  }

  @Get('error')
  @PaymentErrorSwagger()
  error(): string {
    return 'Something went wrong. Check your products page';
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('payments')
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '10' })
  @GetPaymentsSwagger()
  async getPayments(@Req() req, @Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return this.transport.getUserPayments({
      userId: req.user.id,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }
  @Post('stripe/webhook')
  async stripeWebhook(@Req() req: Request, @Res() res: Response) {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = (req as any).rawBody || req.body;

    if (!signature || !rawBody) {
      console.log('[GATEWAY WEBHOOK] Missing signature or body');
      return res.status(400).send('Invalid webhook');
    }

    console.log('[GATEWAY WEBHOOK] OK, length:', rawBody.length);

    try {
      await this.transport.handleStripeWebhook({
        rawBody: typeof rawBody === 'string' ? rawBody : rawBody.toString(),
        headers: req.headers as Record<string, string>,
      });
      return res.status(200).json({ received: true });
    } catch (e) {
      console.error('[GATEWAY WEBHOOK ERROR]', e);
      return res.status(400).send('Error');
    }
  }
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete('subscription/cancel')
  @CancelSubscriptionSwagger()
  async cancelSubscription(@Req() req) {
    return this.commandBus.execute(new CancelSubscriptionCommand(req.user.id));
  }
}
