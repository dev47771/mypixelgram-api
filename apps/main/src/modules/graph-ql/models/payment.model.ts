import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaymentItem {
  @Field()
  id: string;

  @Field({ nullable: true })
  userId?: string;

  @Field()
  paymentDate: string;

  @Field()
  amount: string;

  @Field()
  subscriptionType: string;

  @Field()
  paymentType: string;
}
