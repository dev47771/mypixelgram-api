import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { $Enums } from '@prisma/client';

// Регистрируем enum для GraphQL
registerEnumType($Enums.AccountType, {
  name: 'AccountType',
  description: 'User account type',
});

@ObjectType()
export class CurrentSubscription {
  @Field()
  planName: string;

  @Field()
  expiresAt: string;

  @Field()
  nextPayment: string;
}

@ObjectType()
export class UserModel {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  login: string;

  @Field()
  email: string;

  @Field()
  createdAt: string;

  @Field(() => String, { nullable: true })
  avatar: string | null;

  @Field(() => String, { nullable: true })
  dateOfBirth: string | null;

  @Field(() => $Enums.AccountType)
  accountType: $Enums.AccountType;

  @Field(() => CurrentSubscription, { nullable: true })
  currentSubscription: CurrentSubscription | null;
}
