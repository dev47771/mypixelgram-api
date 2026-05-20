import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { GqlExceptionFilter, GqlContextType } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { DomainException, DomainExceptionCode } from '../domain/domainException';
import { PresentationException, PresentationalExceptionCode } from '../presentational/presentationalException';

@Catch()
export class GraphQLExceptionsFilter implements GqlExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Проверяем, что это GraphQL контекст
    if (host.getType<GqlContextType>() !== 'graphql') {
      throw exception; // Пропускаем для HTTP
    }

    return this.handleGraphQLException(exception);
  }

  private handleGraphQLException(exception: unknown): GraphQLError {
    // Domain exceptions
    if (exception instanceof DomainException) {
      return this.formatDomainException(exception);
    }

    // Presentation exceptions
    if (exception instanceof PresentationException) {
      return this.formatPresentationException(exception);
    }

    // HTTP exceptions (могут прийти из REST клиентов)
    if (exception instanceof HttpException) {
      return this.formatHttpException(exception);
    }

    // GraphQL errors (пробрасываем как есть)
    if (exception instanceof GraphQLError) {
      return exception;
    }

    // Generic errors
    return this.formatGenericError(exception);
  }

  private formatDomainException(exception: DomainException): GraphQLError {
    const codeName = DomainExceptionCode[exception.code] || 'UNKNOWN';

    return new GraphQLError(exception.message, {
      extensions: {
        code: `DOMAIN_${codeName}`,
        statusCode: this.getHttpStatusCodeFromDomainCode(exception.code),
        timestamp: new Date().toISOString(),
        ...(exception.extensions?.meta && { meta: exception.extensions.meta }),
      },
    });
  }

  private formatPresentationException(exception: PresentationException): GraphQLError {
    const codeName = PresentationalExceptionCode[exception.code] || 'UNKNOWN';

    return new GraphQLError(exception.message, {
      extensions: {
        code: `PRESENTATION_${codeName}`,
        statusCode: this.getHttpStatusCodeFromPresentationCode(exception.code),
        timestamp: new Date().toISOString(),
        ...(exception.extensions && { errors: exception.extensions }),
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
        timestamp: new Date().toISOString(),
        ...(errors && { errors }),
      },
    });
  }

  private formatGenericError(exception: unknown): GraphQLError {
    // Логируем неожиданные ошибки
    console.error('Unhandled GraphQL error:', exception);

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
      case 1:
        return HttpStatus.NOT_FOUND;
      case 2:
        return HttpStatus.BAD_REQUEST;
      case 3:
        return HttpStatus.FORBIDDEN;
      case 4:
        return HttpStatus.UNAUTHORIZED;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private getHttpStatusCodeFromPresentationCode(code: number): number {
    switch (code) {
      case 1:
        return HttpStatus.BAD_REQUEST;
      // Добавьте другие коды по необходимости
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
