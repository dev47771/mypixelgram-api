import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';
import { ApiProperty } from '@nestjs/swagger';

export class ExtractDeviceAndIpDto {
  @ApiProperty()
  @IsString()
  ip: string;

  @ApiProperty()
  @IsString()
  @Trim()
  @IsNotEmpty()
  device: string;

  @ApiProperty()
  @IsString()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
