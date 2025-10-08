import { ApiProperty } from '@nestjs/swagger';

class ErrorDescription {
  @ApiProperty()
  field: string;
  @ApiProperty()
  message: string;
}

export class DomainExeptionDto {
  @ApiProperty({ type: [ErrorDescription] })
  errorsMessages: ErrorDescription[];
}
