import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PAYMENT_ROUTE } from '../domain/constants';
import { TransportService } from '../../transport/transport.service';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-strategy/jwt-auth.guard';
import { CreateSubscriptionCheckoutDto } from './input-dto/create-subscription-checkout.input-dto';
import { CreateSubscriptionCheckoutSwagger, GetPaymentsSwagger, PaymentErrorSwagger, PaymentSuccessSwagger } from './decorators/payment-swagger.decorators';

@Controller(PAYMENT_ROUTE)
export class PaymentController {
  constructor(private transport: TransportService) {}

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
}
