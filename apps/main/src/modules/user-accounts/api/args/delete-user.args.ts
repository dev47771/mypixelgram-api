import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class DeleteUserArgs {
  @Field({ nullable: false, description: 'id пользователя, которого хотим удалить' })
  @IsString({ message: 'Должен быть строкой' })
  @IsNotEmpty({ message: 'Не может быть пустым' })
  userId: string;
}
