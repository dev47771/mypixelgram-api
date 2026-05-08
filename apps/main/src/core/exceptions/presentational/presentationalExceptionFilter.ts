import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { Response } from 'express';
import { PresentationalExceptionCode, PresentationException } from './presentationalException';
import { GraphQLError } from 'graphql';

@Catch(PresentationException)
export class PresentationalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: PresentationException, host: ArgumentsHost) {
    // Handle GraphQL context — return GraphQLError directly
    if (host.getType<GqlContextType>() === 'graphql') {
      const codeName = PresentationalExceptionCode[exception.code] || 'UNKNOWN';
      return new GraphQLError(exception.message, {
        extensions: {
          code: `PRESENTATIONAL_${codeName}`,
          statusCode: this.getStatus(exception),
          errors: exception.extensions,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Handle HTTP context
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = this.getStatus(exception);
    const responseBody = this.getResponseBody(exception);
    response.status(status).json(responseBody);
  }

  getStatus(exception: PresentationException): number {
    switch (exception.code) {
      case PresentationalExceptionCode.BadRequest:
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  getResponseBody(exception: PresentationException) {
    return {
      errorsMessages: exception.extensions,
    };
  }
}
