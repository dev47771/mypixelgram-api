import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiForbiddenResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiProperty, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CreateOrUpdateProfileDto } from '../input-dto/create-or-update-profile.input-dto';
import { DomainExceptionDto } from '../../../../core/exceptions/domain/domainException.dto';
import { DESCRIPT_DESC_DELETE_AVATAR, DESCRIPT_HEAD_DELETE_AVATAR, DESCRIPT_NOT_FOUND_DELETE_AVATAR, DESCRIPT_SUCCESS_DELETE_AVATAR, DESCRIPT_UNAUTHORIZED_DELETE_AVATAR } from './constants';

export function ApiGetById(description: string, entity: any) {
  return applyDecorators(ApiOperation({ summary: description }), ApiParam({ name: 'id', type: 'string' }), ApiResponse({ status: 200, description: 'Success', type: entity }), ApiResponse({ status: 404, description: 'Not Found' }));
}

export function ApiCreate(description: string, createDto: any, entity: any, errors) {
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
export function CreateOrUpdateProfileSwagger() {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Create or update user profile',
      description: 'Creates a new profile or updates existing one for the current user. ' + 'Login in the body must belong to the authenticated user; otherwise 403 is returned.',
    }),
    ApiBody({
      description: 'Profile data to create or update',
      type: CreateOrUpdateProfileDto,
    }),
    ApiOkResponse({
      description: 'Profile was successfully created or updated.',
    }),
    ApiBadRequestResponse({
      description: 'Invalid profile data (validation error).',
      type: DomainExceptionDto,
    }),
    ApiForbiddenResponse({
      description: 'User is not allowed to use provided login (FORBIDDEN).',
      type: DomainExceptionDto,
    }),
    ApiUnauthorizedResponse({
      description: 'JWT token is missing or invalid.',
    }),
  );
}

export function DeleteUserAvatarSwagger() {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: DESCRIPT_HEAD_DELETE_AVATAR,
      description: DESCRIPT_DESC_DELETE_AVATAR,
    }),
    ApiNoContentResponse({
      description: DESCRIPT_SUCCESS_DELETE_AVATAR,
    }),
    ApiUnauthorizedResponse({
      description: DESCRIPT_UNAUTHORIZED_DELETE_AVATAR,
    }),
    ApiNotFoundResponse({
      description: DESCRIPT_NOT_FOUND_DELETE_AVATAR,
      type: DomainExceptionDto,
    }),
  );
}
export function GetCountriesWithCitiesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get countries with cities',
      description: 'Returns an object where each key is a country name and the value is an array of its city names. ' + 'The result is cached for some time, so repeated requests may be served from cache without hitting the database.',
    }),
    ApiOkResponse({
      description: 'Successfully retrieved list of countries with their cities.',
      schema: {
        type: 'object',
        additionalProperties: {
          type: 'array',
          items: { type: 'string' },
        },
        example: {
          Azerbaijan: ['Baku', 'Ganja', 'Sumqayit'],
          Germany: ['Berlin', 'Munich', 'Hamburg'],
        },
      },
    }),
  );
}
