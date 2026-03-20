import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';
import { Post } from './post.model';
import { Payment } from './payment.model';

@ObjectType()
export class General {
  @Field((type) => [User])
  users: User[];

  @Field((type) => [Post])
  posts: Post[];

  @Field((type) => [Payment])
  payments: Payment[];
}
