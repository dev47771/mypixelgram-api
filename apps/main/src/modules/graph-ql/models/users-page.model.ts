import { Field, ObjectType, Int } from '@nestjs/graphql';
import { UserModel } from './user.model';
import { PaymentItem } from './payment.model';

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

  @Field(() => [PaymentItem], { nullable: true, description: 'Платежи пользователя (если запрошен конкретный userId) или платежи всех пользователей' })
  payments?: PaymentItem[];

  @Field(() => PageInfo, { nullable: true, description: 'Пагинация платежей' })
  paymentsPagination?: PageInfo;
}
