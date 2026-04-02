import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { GqlArgumentsHost, GqlContextType, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { DomainException, DomainExceptionCode } from './domain/domainException';
import { PresentationException, PresentationalExceptionCode } from './presentational/presentationalException';

@Catch()
export class GraphQLExceptionsFilter implements ExceptionFilter, GqlExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Check if this is a GraphQL context
    if (host.getType<GqlContextType>() === 'graphql') {
      return this.handleGraphQLException(exception, host);
    }

    // If not GraphQL, let other filters handle it
    return;
  }

  private handleGraphQLException(exception: unknown, host: ArgumentsHost): GraphQLError {
    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext();

    // Handle different types of exceptions
    if (exception instanceof DomainException) {
      return this.formatDomainException(exception);
    }

    if (exception instanceof PresentationException) {
      return this.formatPresentationalException(exception);
    }

    if (exception instanceof HttpException) {
      return this.formatHttpException(exception);
    }

    if (exception instanceof GraphQLError) {
      return exception;
    }

    // Handle generic errors
    return this.formatGenericError(exception);
  }

  private formatDomainException(exception: DomainException): GraphQLError {
    const codeName = DomainExceptionCode[exception.code] || 'UNKNOWN';
    return new GraphQLError(exception.message, {
      extensions: {
        code: `DOMAIN_${codeName}`,
        statusCode: this.getHttpStatusCodeFromDomainCode(exception.code),
        meta: exception.extensions.meta,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private formatPresentationalException(exception: PresentationException): GraphQLError {
    const codeName = PresentationalExceptionCode[exception.code] || 'UNKNOWN';
    return new GraphQLError(exception.message, {
      extensions: {
        code: `PRESENTATIONAL_${codeName}`,
        statusCode: this.getHttpStatusCodeFromPresentationalCode(exception.code),
        errors: exception.extensions,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private formatHttpException(exception: HttpException): GraphQLError {
    const response = exception.getResponse();
    const status = exception.getStatus();

    let message = exception.message;
    let errors: any = null;

    if (typeof response === 'object' && response !== null) {
      const respObj = response as any;
      message = respObj.message || exception.message;
      errors = respObj.errorsMessages || respObj.errors || null;
    }

    return new GraphQLError(message, {
      extensions: {
        code: `HTTP_${status}`,
        statusCode: status,
        errors,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private formatGenericError(exception: unknown): GraphQLError {
    const message = exception instanceof Error ? exception.message : 'Internal server error';

    return new GraphQLError(message, {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private getHttpStatusCodeFromDomainCode(code: number): number {
    switch (code) {
      case 1: // NotFound
        return HttpStatus.NOT_FOUND;
      case 2: // BadRequest
        return HttpStatus.BAD_REQUEST;
      case 3: // Forbidden
        return HttpStatus.FORBIDDEN;
      case 4: // Unauthorized
        return HttpStatus.UNAUTHORIZED;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private getHttpStatusCodeFromPresentationalCode(code: number): number {
    // Assuming PresentationalExceptionCode follows similar pattern
    // You might need to import and use the actual enum
    switch (code) {
      case 1: // BadRequest
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
