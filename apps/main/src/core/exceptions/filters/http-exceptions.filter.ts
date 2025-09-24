import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FieldError } from '../field-error';
import { ConfigService } from '@nestjs/config';

@Injectable()
@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  constructor(private configService: ConfigService) {}

  catch(exception: HttpException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    //console.error(exception);

    if (status === 500 && this.configService.get('NODE_ENV') !== 'production') {
      response.status(status).json(exception);
      return;
    }

    if (status === 400) {
      const errorResult: { errorsMessages: FieldError[] } = {
        errorsMessages: [],
      };

      const exceptionResponse: any = exception.getResponse();

      exceptionResponse.errors.forEach((error: FieldError) =>
        errorResult.errorsMessages.push(error),
      );

      response.status(status).json(errorResult);
      return;
    }

    response.sendStatus(status);
  }
}
