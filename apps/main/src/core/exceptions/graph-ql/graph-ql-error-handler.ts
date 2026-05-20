// core/exceptions/graphql-error-handler.service.ts
import { Injectable } from '@nestjs/common';
import { GraphQLExceptionsFilter } from './graphqlExceptionFilter';

@Injectable()
export class GraphQLErrorHandler {
  private filter: GraphQLExceptionsFilter;

  constructor() {
    this.filter = new GraphQLExceptionsFilter();
  }

  handle(error: unknown) {
    const mockHost = {
      getType: () => 'graphql',
      switchToHttp: () => {
        throw new Error('Not HTTP context');
      },
      getArgByIndex: () => ({}),
      getArgs: () => ({}),
      getClass: () => null,
      getHandler: () => null,
    } as any;

    const result = this.filter.catch(error, mockHost);

    return {
      message: result.message,
      extensions: result.extensions,
    };
  }
}
