import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import {
  loginConstraints,
  passwordConstraints,
} from '../../domain/user-constraints';
import { Trim } from '../../../../core/decorators/transform/trim';

export class CreateUserInputDto {
  //@Matches(/^[a-zA-Z0-9_-]*$/)
  @Length(6, 30)
  @Trim()
  login: string;

  @IsEmail()
  @Trim()
  email: string;

  @Matches(passwordConstraints.match, {
    message:
      'Password must contain 0-9, a-z, A-Z, ! " # $ % & \' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ _ { | } ~',
  })
  @Length(6, 20)
  @Trim()
  @IsNotEmpty()
  password: string;
}
