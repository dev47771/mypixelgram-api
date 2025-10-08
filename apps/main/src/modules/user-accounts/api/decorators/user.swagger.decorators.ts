import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function ApiGetById(description: string, entity: any) {
  return applyDecorators(
    ApiOperation({ summary: description }),
    ApiParam({ name: 'id', type: 'string' }),
    ApiResponse({ status: 200, description: 'Success', type: entity }),
    ApiResponse({ status: 404, description: 'Not Found' }),
  );
}

export function ApiCreate(
  description: string,
  createDto: any,
  entity: any,
  errors,
) {
  return applyDecorators(
    ApiOperation({ summary: description }),
    ApiBody({ type: createDto }),
    ApiResponse({
      status: 201,
      description: 'The user was successfully created',
      type: entity,
    }),
    ApiResponse({
      status: 400,
      description: 'If the inputModel has incorrect values',
      type: errors,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}
