import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class BlockOrUnblockUserArgs {
  @Field({ description: 'ID пользователя которого надо заблокировать или разблокировать' })
  id: string;

  @Field({ nullable: true, description: 'ID жалобы' })
  reasonId?: number;

  @Field({ nullable: true, description: 'Детали жалобы если указана причина "Another reason"' })
  reasonDetail?: string;
}
