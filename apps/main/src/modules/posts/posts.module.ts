import { Module } from '@nestjs/common';
import { PostController } from './api/post.controller';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { UpdatePostUseCase } from './application/update-post.use-case';
import { PostsRepo } from './infrastructure/post.repo';
import { PublicPostController } from './api/public-post.contoller';

const commandHandlers = [UpdatePostUseCase];
const commonProviders = [PostsRepo];

@Module({
  imports: [UserAccountsModule],
  controllers: [PostController, PublicPostController],
  providers: [...commandHandlers, ...commonProviders],
})
export class PostModule {}