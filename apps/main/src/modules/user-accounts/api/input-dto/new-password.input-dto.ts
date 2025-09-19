import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { passwordConstraints } from '../../domain/user-constraints';
import { IsStringOfLengthWithTrim } from '../../../../core/decorators/validation/is-string-of-length-with-trim';

export class NewPasswordInputDto {
  @Matches(passwordConstraints.match, {
    message:
      'Password must contain 0-9, a-z, A-Z, ! " # $ % & \' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ _ { | } ~',
  })
  @IsStringOfLengthWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  recoveryCode: string;
}
