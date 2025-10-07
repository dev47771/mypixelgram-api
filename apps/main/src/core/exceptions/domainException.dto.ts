import { ApiProperty } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';

class ErrorDescription {
  @ApiProperty()
  field: string;
  @ApiProperty()
  message: string;
}

export class DomainExeptionDto {
  @ApiProperty({ type: [BadRequestException] })
  errorsMessages: BadRequestException[];
}
