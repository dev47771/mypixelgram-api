import { IsOptional, IsUUID } from 'class-validator';

export class GetMyNotificationsDto {
  @IsOptional()
  @IsUUID()
  cursor?: string;
}
