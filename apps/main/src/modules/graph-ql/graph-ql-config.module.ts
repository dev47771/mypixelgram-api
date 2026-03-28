import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'node:path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isDev = configService.get('NODE_ENV') !== 'production';

        return {
          autoSchemaFile: join(__dirname, 'schema.graphql'),
          graphiql: true,
          debug: true,
          context: ({ req, res }) => ({ req, res }),
          //path: '/api/v1/graphql',
          // cors: {
          //   //origin: true, // или конкретный URL: 'http://localhost:3000'
          //   credentials: true, // Разрешает отправку куки
          // },
          // playground: {
          //   settings: {
          //     'request.credentials': 'include', // Отправлять куки с запросом
          //   },
          // },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class GraphQlConfigModule {}
