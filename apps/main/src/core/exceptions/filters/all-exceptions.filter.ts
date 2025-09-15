import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private configService: ConfigService) {}

  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.error(exception);

    if (this.configService.get('NODE_ENV') !== 'production') {
      response
        .status(500)
        .json({ error: exception.toString(), stack: exception.stack });
    } else {
      response.status(500).send('Some error occurred');
    }
  }
}
