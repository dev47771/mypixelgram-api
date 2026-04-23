import { Field, ObjectType, Int } from '@nestjs/graphql';
import { UserModel } from './user.model';

@ObjectType()
export class PageInfo {
  @Field(() => Int)
  pageNumber: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  totalItems: number;
}

@ObjectType()
export class UsersPageResponse {
  @Field(() => [UserModel])
  users: UserModel[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
