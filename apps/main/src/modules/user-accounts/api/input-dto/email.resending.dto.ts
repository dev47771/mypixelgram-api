import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailDto {
  @ApiProperty({
    example: 'example@mail.com',
  })
  @IsEmail()
  public email: string;
}
