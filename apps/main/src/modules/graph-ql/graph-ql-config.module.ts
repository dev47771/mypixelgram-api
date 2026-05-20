// modules/graph-ql/graph-ql-config.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'node:path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLErrorHandler } from '../../core/exceptions/graph-ql/graph-ql-error-handler';
import { GraphQLError } from 'graphql';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isDev = configService.get('NODE_ENV') !== 'production';

        const errorHandler = new GraphQLErrorHandler();

        return {
          autoSchemaFile: join(__dirname, 'schema.graphql'),
          graphiql: true,
          debug: isDev,
          context: ({ req, res }) => ({ req, res }),
          path: '/api/v1/graphql',
          introspection: true,

          formatError: (formattedError: any, error: { originalError?: any }) => {
            const originalError = error.originalError || error;
            return errorHandler.handle(originalError);
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [GraphQLErrorHandler],
})
export class GraphQlConfigModule {}
