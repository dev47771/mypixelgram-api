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
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserInputDto {
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
}
