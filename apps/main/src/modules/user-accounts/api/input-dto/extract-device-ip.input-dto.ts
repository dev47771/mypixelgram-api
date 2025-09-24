import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class ExtractDeviceAndIpDto {
  @IsString()
  ip: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  device: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
