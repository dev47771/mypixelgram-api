import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  DESCRIPT_BAD_REQUEST_CHECK_RECOVERY,
  DESCRIPT_BAD_REQUEST_CONFIRM,
  DESCRIPT_BAD_REQUEST_LOGIN,
  DESCRIPT_BAD_REQUEST_NEW_PASSWORD,
  DESCRIPT_BAD_REQUEST_RECOVER_PASSWORD,
  DESCRIPT_BAD_REQUEST_RESENDING,
  DESCRIPT_HEAD_CHECK_RECOVERY_CODE,
  DESCRIPT_HEAD_CONFIRM,
  DESCRIPT_HEAD_GET_USER_ACC,
  DESCRIPT_HEAD_LOGIN,
  DESCRIPT_HEAD_LOGOUT,
  DESCRIPT_HEAD_NEW_PASSWORD,
  DESCRIPT_HEAD_RECOVER_PASSWORD,
  DESCRIPT_HEAD_REFRESH_TOKEN,
  DESCRIPT_HEAD_REGISTR,
  DESCRIPT_HEAD_RESENDING,
  DESCRIPT_SUCCESS_CHECK_RECOVERY,
  DESCRIPT_SUCCESS_CONFIRM,
  DESCRIPT_SUCCESS_LOGIN,
  DESCRIPT_SUCCESS_LOGOUT,
  DESCRIPT_SUCCESS_NEW_PASSWORD,
  DESCRIPT_SUCCESS_RECOVER_PASSWORD,
  DESCRIPT_SUCCESS_REGISTR,
  DESCRIPT_SUCCESS_RESENDING,
  DESCRIPT_SUCCESS_USER_ACC,
  DESCRIPT_TEXT_CONFIRM,
  DESCRIPT_TEXT_RECOVER_PASSWORD,
  DESCRIPT_TEXT_REFRESH_TOKEN,
  DESCRIPT_TEXT_REGISTR,
  DESCRIPT_UNAUTHORIZED_LOGIN,
  DESCRIPT_UNAUTHORIZED_LOGOUT,
  DESCRIPT_UNAUTHORIZED_REFRESH_TOKEN,
  DESCRIPT_UNAUTHORIZED_USER_ACC,
  EXAMPLE_EMAIL_LINK_CODE,
} from './constants';
import { CreateUserInputDto } from '../input-dto/create-user.input-dto';
import { DomainExeptionDto } from '../../../../core/exceptions/domainException.dto';
import { EmailDto } from '../input-dto/email.resending.dto';
import { CodeDto } from '../input-dto/code.dto';
import { AccessToken } from '../view-dto/access.token.dto';
import { NewPasswordInputDto } from '../input-dto/new-password.input-dto';
import { UserViewDto } from '../view-dto/user.view-dto';

export function Registration() {
  return applyDecorators(
    ApiOperation({
      summary: DESCRIPT_HEAD_REGISTR,
      description: DESCRIPT_TEXT_REGISTR,
    }),
    ApiBody({ type: CreateUserInputDto }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: DESCRIPT_SUCCESS_REGISTR,
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, type: DomainExeptionDto }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized',
    }),
  );
}

export function RegisterEmailResending() {
  return applyDecorators(
    ApiOperation({
      summary: DESCRIPT_HEAD_RESENDING,
    }),
    ApiBody({ type: EmailDto }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: DESCRIPT_SUCCESS_RESENDING,
      example: EXAMPLE_EMAIL_LINK_CODE,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: DESCRIPT_BAD_REQUEST_RESENDING,
      type: DomainExeptionDto,
    }),
  );
}

export function RegistrationConfirmation() {
  return applyDecorators(
    ApiOperation({
      summary: DESCRIPT_HEAD_CONFIRM,
      description: DESCRIPT_TEXT_CONFIRM,
    }),
    ApiBody({ type: CodeDto }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: DESCRIPT_SUCCESS_CONFIRM,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: DESCRIPT_BAD_REQUEST_CONFIRM,
      type: DomainExeptionDto,
    }),
  );
}

export function Login() {
  return applyDecorators(
    ApiOperation({
      summary: DESCRIPT_HEAD_LOGIN,
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: DESCRIPT_SUCCESS_LOGIN,
      type: AccessToken,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: DESCRIPT_BAD_REQUEST_LOGIN,
      type: DomainExeptionDto,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: DESCRIPT_UNAUTHORIZED_LOGIN,
    }),
  );
}

export function RecoverPassword() {
  return applyDecorators(
    ApiOperation({
      summary: DESCRIPT_HEAD_RECOVER_PASSWORD,
      description: DESCRIPT_TEXT_RECOVER_PASSWORD,
    }),
    ApiBody({ type: EmailDto }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: DESCRIPT_SUCCESS_RECOVER_PASSWORD,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: DESCRIPT_BAD_REQUEST_RECOVER_PASSWORD,
      type: DomainExeptionDto,
    }),
  );
}

export function CheckRecoveryCode() {
  return applyDecorators(
    ApiOperation({
      summary: DESCRIPT_HEAD_CHECK_RECOVERY_CODE,
    }),
    ApiBody({ type: CodeDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: DESCRIPT_SUCCESS_CHECK_RECOVERY,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: DESCRIPT_BAD_REQUEST_CHECK_RECOVERY,
      type: DomainExeptionDto,
    }),
  );
}

export function SetNewPassword() {
  return applyDecorators(
    ApiOperation({
      summary: DESCRIPT_HEAD_NEW_PASSWORD,
    }),
    ApiBody({ type: NewPasswordInputDto }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: DESCRIPT_SUCCESS_NEW_PASSWORD,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: DESCRIPT_BAD_REQUEST_NEW_PASSWORD,
      type: DomainExeptionDto,
    }),
  );
}

export function Logout() {
  return applyDecorators(
    ApiOperation({
      summary: DESCRIPT_HEAD_LOGOUT,
    }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: DESCRIPT_SUCCESS_LOGOUT,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: DESCRIPT_UNAUTHORIZED_LOGOUT,
    }),
  );
}

export function GetUserAccounts() {
  return applyDecorators(
    ApiOperation({
      summary: DESCRIPT_HEAD_GET_USER_ACC,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: DESCRIPT_SUCCESS_USER_ACC,
      type: UserViewDto,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: DESCRIPT_UNAUTHORIZED_USER_ACC,
    }),
  );
}

export function RefreshToken() {
  return applyDecorators(
    ApiOperation({
      summary: DESCRIPT_HEAD_REFRESH_TOKEN,
      description: DESCRIPT_TEXT_REFRESH_TOKEN,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description:
        'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds).',
      type: AccessToken,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: DESCRIPT_UNAUTHORIZED_REFRESH_TOKEN,
    }),
  );
}
