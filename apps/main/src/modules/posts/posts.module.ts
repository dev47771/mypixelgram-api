import { Module } from '@nestjs/common';
import { PostController } from './api/post.controller';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';

@Module({
  imports: [UserAccountsModule],
  controllers: [PostController],
  providers: [],
})
export class PostModule {}