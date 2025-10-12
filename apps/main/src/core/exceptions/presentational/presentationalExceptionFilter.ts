import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  PresentationalExceptionCode,
  PresentationException,
} from './presentationalException';

@Catch(PresentationException)
export class PresentationalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: PresentationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = this.getStatus(exception);
    const responseBody = this.getResponseBody(exception);
    response.status(status).json(responseBody);
  }

  getStatus(exception: PresentationException): number {
    switch (exception.code) {
      case PresentationalExceptionCode.BadRequest:
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.I_AM_A_TEAPOT;
    }
  }

  getResponseBody(exception: PresentationException) {
    return {
      errorsMessages: exception.extensions,
    };
  }
}
