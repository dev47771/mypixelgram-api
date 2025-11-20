import { Module } from '@nestjs/common';
import { PostController } from './api/post.controller';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { UpdatePostUseCase } from './application/update-post.use-case';
import { PostsRepo } from './infrastructure/post.repo';
import { PublicPostController } from './api/public-post.contoller';
import { CreatePostUseCase } from './application/create-post.use-case';
import { TransportModule } from '../transport/transport.module';
import { PostsQueryRepo } from './infrastructure/post-query.repo';
import { DeletePostUseCase } from './application/delete-post.use-case';
import { GetPostsByUserIdQueryPublic } from './application/queryBus/getPostsByUserIdQuery.public';
import { DictFilesService } from './infrastructure/dictFilesService';
import { GetPostByPostIdQueryPublic } from './application/queryBus/getPostByPostIdQuery.public';
import { GetProfileByLogin } from '../user-accounts/application/queries/getProfileByLogin';

const commandHandlers = [UpdatePostUseCase, CreatePostUseCase, DeletePostUseCase];
const queryHundlers = [GetPostsByUserIdQueryPublic, GetPostByPostIdQueryPublic];
const commonProviders = [PostsRepo, PostsQueryRepo, DictFilesService];

@Module({
  imports: [UserAccountsModule, TransportModule],
  controllers: [PostController, PublicPostController],
  providers: [...commandHandlers, ...commonProviders, ...queryHundlers],
})
export class PostModule {}
