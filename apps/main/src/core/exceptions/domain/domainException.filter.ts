import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { DomainException, DomainExceptionCode } from './domainException';
import { Response } from 'express';
import { GraphQLError } from 'graphql';

@Catch(DomainException)
export class DomainHttpExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    // Handle GraphQL context — return GraphQLError directly
    if (host.getType<GqlContextType>() === 'graphql') {
      const statusCode = this.getStatus(exception);
      return new GraphQLError(exception.message, {
        extensions: {
          code: statusCode,
          meta: exception.extensions.meta,
          message: exception.extensions.message,
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

  getStatus(exception: DomainException): number {
    switch (exception.code) {
      case DomainExceptionCode.BadRequest:
        return HttpStatus.BAD_REQUEST;
      case DomainExceptionCode.Forbidden:
        return HttpStatus.FORBIDDEN;
      case DomainExceptionCode.NotFound:
        return HttpStatus.NOT_FOUND;
      case DomainExceptionCode.Unauthorized:
        return HttpStatus.UNAUTHORIZED;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  getResponseBody(exception: DomainException) {
    return exception.extensions;
  }
}
