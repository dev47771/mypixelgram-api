import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import {
  loginConstraints,
  passwordConstraints,
} from '../../domain/user-constraints';
import { IsStringOfLengthWithTrim } from '../../../../core/decorators/validation/is-string-of-length-with-trim';
import { Trim } from '../../../../core/decorators/transform/trim';

export class CreateUserInputDto {
  @Matches(loginConstraints.match)
  @IsStringOfLengthWithTrim(
    loginConstraints.minLength,
    loginConstraints.maxLength,
  )
  @IsNotEmpty()
  login: string;

  @IsEmail()
  @Trim()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Matches(passwordConstraints.match, {
    message:
      'Password must contain 0-9, a-z, A-Z, ! " # $ % & \' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ _ { | } ~',
  })
  @IsStringOfLengthWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  @IsNotEmpty()
  password: string;
}
