import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '../../../core/decorators/transform/trim';
import { passwordConstraints } from '../domain/user-constraints';

export class RecaptchaTokenDto {
  @ApiProperty({
    description: 'Google reCAPTCHA token',
  })
  @IsString()
  @IsNotEmpty()
  recaptchaToken: string;
}

export class RegistrationWithRecaptchaDto {
  @ApiProperty({
    description: 'must be unique login',
    example: 'lolikkk',
    minLength: 6,
    maxLength: 30,
  })
  @Length(6, 30)
  @Trim()
  login: string;

  @ApiProperty({
    description: 'must be unique email',
    example: 'user@mail.com',
    maxLength: 255,
    pattern: '^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
  })
  @IsEmail()
  @Trim()
  email: string;

  @ApiProperty({
    example: 'string',
    minLength: 6,
    maxLength: 20,
    pattern:
      '0-9, a-z, A-Z, ! " # $ % & \' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ _ { | } ~',
  })
  @Matches(passwordConstraints.match, {
    message:
      'Password must contain 0-9, a-z, A-Z, ! " # $ % & \' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ _ { | } ~',
  })
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  recaptchaToken: string;
}
