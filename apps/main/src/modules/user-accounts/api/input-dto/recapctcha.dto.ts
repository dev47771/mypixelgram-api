import { ApiProperty } from '@nestjs/swagger';

export class RecaptchaTokenDto {
  @ApiProperty()
  recaptchaToken: string;
}
