import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiProperty, ApiQuery, ApiUnauthorizedResponse } from '@nestjs/swagger';
import {
  DESCRIPT_BAD_REQUEST_CHECKOUT,
  DESCRIPT_BAD_REQUEST_PAYMENTS,
  DESCRIPT_DESC_CREATE_CHECKOUT,
  DESCRIPT_DESC_GET_PAYMENTS,
  DESCRIPT_HEAD_CREATE_CHECKOUT,
  DESCRIPT_HEAD_ERROR,
  DESCRIPT_HEAD_GET_PAYMENTS,
  DESCRIPT_HEAD_SUCCESS,
  DESCRIPT_SUCCESS_CREATE_CHECKOUT,
  DESCRIPT_SUCCESS_ERROR_PAGE,
  DESCRIPT_SUCCESS_GET_PAYMENTS,
  DESCRIPT_SUCCESS_SUCCESS_PAGE,
  DESCRIPT_UNAUTHORIZED,
} from '../../domain/decorator-constants';
import { PaymentHistoryItemDto } from '../view-dto/payment-view.dto';
import { CreateSubscriptionCheckoutDto } from '../input-dto/create-subscription-checkout.input-dto';
import { DESCRIPT_BAD_REQUEST_CANCEL_SUBSCRIPTION, DESCRIPT_DESC_CANCEL_SUBSCRIPTION, DESCRIPT_HEAD_CANCEL_SUBSCRIPTION, DESCRIPT_SUCCESS_CANCEL_SUBSCRIPTION } from './constants';

export function CreateSubscriptionCheckoutSwagger() {
  return applyDecorators(
    ApiBody({ type: CreateSubscriptionCheckoutDto }),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: DESCRIPT_HEAD_CREATE_CHECKOUT,
      description: DESCRIPT_DESC_CREATE_CHECKOUT,
    }),
    ApiOkResponse({
      description: DESCRIPT_SUCCESS_CREATE_CHECKOUT,
      schema: {
        example: { paymentUrl: 'https://checkout.stripe.com/c/pay/cs_test_abc123...' },
      },
    }),
    ApiBadRequestResponse({
      description: DESCRIPT_BAD_REQUEST_CHECKOUT,
    }),
    ApiUnauthorizedResponse({
      description: DESCRIPT_UNAUTHORIZED,
    }),
  );
}

export function GetPaymentsSwagger() {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: DESCRIPT_HEAD_GET_PAYMENTS,
      description: DESCRIPT_DESC_GET_PAYMENTS,
    }),
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number (1-based)',
      type: Number,
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Items per page (default: 10, max: 50)',
      type: Number,
      example: 10,
    }),
    ApiOkResponse({
      description: DESCRIPT_SUCCESS_GET_PAYMENTS,
      type: PaymentsResponseDto,
    }),
    ApiBadRequestResponse({
      description: DESCRIPT_BAD_REQUEST_PAYMENTS,
    }),
    ApiUnauthorizedResponse({
      description: DESCRIPT_UNAUTHORIZED,
    }),
  );
}

export function PaymentSuccessSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: DESCRIPT_HEAD_SUCCESS,
    }),
    ApiOkResponse({
      description: DESCRIPT_SUCCESS_SUCCESS_PAGE,
      schema: {
        example: {
          message: 'Great. You bought the best product. Check your products page',
        },
      },
    }),
  );
}

export function PaymentErrorSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: DESCRIPT_HEAD_ERROR,
    }),
    ApiOkResponse({
      description: DESCRIPT_SUCCESS_ERROR_PAGE,
      schema: {
        example: {
          message: 'Something went wrong. Check your products page',
        },
      },
    }),
  );
}
export class PaymentsResponseDto {
  @ApiProperty({ type: [PaymentHistoryItemDto] })
  payments: PaymentHistoryItemDto[];

  @ApiProperty({
    type: 'object',
    properties: {
      page: { example: 1 },
      limit: { example: 10 },
      total: { example: 45 },
      pages: { example: 5 },
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function CancelSubscriptionSwagger() {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: DESCRIPT_HEAD_CANCEL_SUBSCRIPTION,
      description: DESCRIPT_DESC_CANCEL_SUBSCRIPTION,
    }),
    ApiOkResponse({
      description: DESCRIPT_SUCCESS_CANCEL_SUBSCRIPTION,
    }),
    ApiBadRequestResponse({
      description: DESCRIPT_BAD_REQUEST_CANCEL_SUBSCRIPTION,
      schema: {
        example: {
          message: 'Payment Not Found',
          meta: 'CancelSubscriptionCommand',
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: DESCRIPT_UNAUTHORIZED,
    }),
  );
}
