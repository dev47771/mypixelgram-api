import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class AdminLoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class AdminAuthResponse {
  @Field()
  accessToken: string;
}

@ObjectType()
export class AdminLogoutResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
