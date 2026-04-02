import { Field, ObjectType } from '@nestjs/graphql';
import { UserModel } from './user.model';

@ObjectType()
export class PageInfo {
  @Field(() => String, { nullable: true })
  nextCursor: string | null;

  @Field()
  hasMore: boolean;
}

@ObjectType()
export class UsersPageResponse {
  @Field(() => [UserModel])
  users: UserModel[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
