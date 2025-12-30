import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GetUserSessionsOutputDto } from '../view-dto/session.view-dto';

export function GetUserSessionsSwagger() {
  return applyDecorators(
    ApiCookieAuth('refreshToken'),
    ApiOperation({
      summary: 'Get active user sessions',
      description: 'Returns a list of active user sessions. ' + 'The last activity time is determined by the most recent refresh token usage.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of active user sessions',
      type: GetUserSessionsOutputDto,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Refresh token is missing, expired, or invalid',
    }),
  );
}
export function TerminateDeviceSessionSwagger() {
  return applyDecorators(
    ApiCookieAuth('refreshToken'),
    ApiOperation({
      summary: 'Terminate a specific device session',
      description: 'Terminates a specific user session by device ID. ' + 'The session must belong to the authenticated user.',
    }),
    ApiParam({
      name: 'deviceId',
      required: true,
      description: 'ID of the session (device) to be terminated',
      example: '7bf3c665-6515-4879-beda-aa2a238f6a13',
    }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Session successfully terminated',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Refresh token is missing, expired, or invalid',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Attempt to terminate a session belonging to another user',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Session with the specified deviceId was not found',
    }),
  );
}
export function TerminateAllExceptCurrentSwagger() {
  return applyDecorators(
    ApiCookieAuth('refreshToken'),
    ApiOperation({
      summary: 'Terminate all sessions except the current one',
      description: 'Terminates all active sessions of the authenticated user ' + 'except the session associated with the current device.',
    }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'All sessions except the current one were successfully terminated',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Refresh token is missing, expired, or invalid',
    }),
  );
}
