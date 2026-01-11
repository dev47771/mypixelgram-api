import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateSubscriptionCheckoutDto {
  @ApiProperty({
    description: 'Subscription duration',
    enum: ['DAY', 'WEEK', 'MONTH', 'YEAR'],
    example: 'YEAR',
  })
  @IsEnum(['DAY', 'WEEK', 'MONTH', 'YEAR'])
  @IsNotEmpty()
  planId: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
}
