import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class PasswordRecoveryInputDto {
  @IsEmail()
  @Trim()
  @IsString()
  @IsNotEmpty()
  email: string;
}
