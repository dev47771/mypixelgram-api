import {
  applyDecorators,
  HttpStatus,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { RecaptchaGuard } from '../guards/recaptcha-guard/recaptcha.guard';
import { RECAPTCHA_ACTION, RECAPTCHA_SKIP } from './constants';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { DomainExeptionDto } from '../../../../core/exceptions/domainException.dto';

export function Recaptcha(action?: string) {
  return applyDecorators(
    SetMetadata(RECAPTCHA_ACTION, action),
    ApiOperation({ summary: 'Return success ' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          recaptchaToken: {
            type: 'string',
            description: 'Google reCAPTCHA token',
          },
        },
      },
    }),
    UseGuards(RecaptchaGuard),
    ApiParam({ name: 'reCAPTCHA', type: 'string' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Successful recaptcha verification',
      schema: {
        example: { success: true }
      },
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description:
        'reCAPTCHA token is required or recaptcha verification failed',
      type: DomainExeptionDto,
    }),
  );
}

export function SkipRecaptcha() {
  return SetMetadata(RECAPTCHA_SKIP, true);
}

export function RecaptchaBody() {
  return ApiBody({
    schema: {
      type: 'object',
      properties: {
        recaptchaToken: {
          type: 'string',
          description: 'Google reCAPTCHA token',
        },
      },
    },
  });
}
