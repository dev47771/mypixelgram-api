import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsUUID } from 'class-validator';

@ArgsType()
export class GetUsersArgs {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  cursor?: string;
}
