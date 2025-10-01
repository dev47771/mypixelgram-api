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
  @Length(3, 10)
  login: string;
  @Length(6, 20)
  password: string;
  @IsEmail({}, { message: 'Incorrect email' })
  email: string;
}
