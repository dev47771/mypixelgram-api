import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  DESCRIPT_BAD_REQUEST_CREATE_POST,
  DESCRIPT_BAD_REQUEST_DELETE_POST,
  DESCRIPT_BAD_REQUEST_GET_POST_BY_ID_PUBLIC,
  DESCRIPT_BAD_REQUEST_GET_USER_POSTS_PUBLIC,
  DESCRIPT_BAD_REQUEST_MY_POSTS,
  DESCRIPT_BAD_REQUEST_UPDATE_POST,
  DESCRIPT_CURSOR_MY_POSTS,
  DESCRIPT_DESC_CREATE_POST,
  DESCRIPT_DESC_DELETE_POST,
  DESCRIPT_DESC_GET_POST_BY_ID_PUBLIC,
  DESCRIPT_DESC_GET_USER_POSTS_PUBLIC,
  DESCRIPT_DESC_MY_POSTS,
  DESCRIPT_DESC_UPDATE_POST,
  DESCRIPT_FORBIDDEN_DELETE_POST,
  DESCRIPT_FORBIDDEN_UPDATE_POST,
  DESCRIPT_HEAD_CREATE_POST,
  DESCRIPT_HEAD_DELETE_POST,
  DESCRIPT_HEAD_GET_POST_BY_ID_PUBLIC,
  DESCRIPT_HEAD_GET_USER_POSTS_PUBLIC,
  DESCRIPT_HEAD_LAST_POSTS,
  DESCRIPT_HEAD_MY_POSTS,
  DESCRIPT_HEAD_UPDATE_POST,
  DESCRIPT_NOT_FOUND_DELETE_POST,
  DESCRIPT_NOT_FOUND_GET_POST_BY_ID_PUBLIC,
  DESCRIPT_NOT_FOUND_GET_USER_POSTS_PUBLIC,
  DESCRIPT_NOT_FOUND_UPDATE_POST,
  DESCRIPT_SUCCESS_CREATE_POST,
  DESCRIPT_SUCCESS_DELETE_POST,
  DESCRIPT_SUCCESS_GET_POST_BY_ID_PUBLIC,
  DESCRIPT_SUCCESS_GET_USER_POSTS_PUBLIC,
  DESCRIPT_SUCCESS_LAST_POSTS,
  DESCRIPT_SUCCESS_MY_POSTS,
  DESCRIPT_SUCCESS_UPDATE_POST,
  DESCRIPT_UNAUTHORIZED_CREATE_POST,
  DESCRIPT_UNAUTHORIZED_DELETE_POST,
  DESCRIPT_UNAUTHORIZED_MY_POSTS,
  DESCRIPT_UNAUTHORIZED_UPDATE_POST,
} from './post.constants';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CreateInputDto, LastPostsResponseDto, PostByPostIdViewDto, PostByUserIdViewDto, PostInputDto, UserPostsInfiniteResponseDto } from './dto';
import { DomainExceptionDto } from '../../../core/exceptions/domain/domainException.dto';

export function LastPostsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: DESCRIPT_HEAD_LAST_POSTS,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: DESCRIPT_SUCCESS_LAST_POSTS,
      type: LastPostsResponseDto,
    }),
  );
}

export function MyPostsInfinitySwagger() {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: DESCRIPT_HEAD_MY_POSTS,
      description: DESCRIPT_DESC_MY_POSTS,
    }),
    ApiQuery({
      name: 'cursor',
      required: false,
      description: DESCRIPT_CURSOR_MY_POSTS,
      type: String,
      example: 'c3c829a4-9f2c-4e2f-9e4b-9f6d1320d1a3',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: DESCRIPT_SUCCESS_MY_POSTS,
      type: UserPostsInfiniteResponseDto,
    }),
    ApiBadRequestResponse({
      description: DESCRIPT_BAD_REQUEST_MY_POSTS,
      type: DomainExceptionDto,
    }),
    ApiUnauthorizedResponse({
      description: DESCRIPT_UNAUTHORIZED_MY_POSTS,
    }),
  );
}
export function UpdatePostSwagger() {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: DESCRIPT_HEAD_UPDATE_POST,
      description: DESCRIPT_DESC_UPDATE_POST,
    }),
    ApiParam({
      name: 'id',
      description: 'Post ID to update',
      example: '65f4d9e2-3a3f-4c1e-9d78-6a81e8b2f9a1',
    }),
    ApiBody({
      type: PostInputDto,
      description: 'Fields to update (description and location)',
    }),
    ApiNoContentResponse({
      description: DESCRIPT_SUCCESS_UPDATE_POST,
    }),
    ApiBadRequestResponse({
      description: DESCRIPT_BAD_REQUEST_UPDATE_POST,
      type: DomainExceptionDto,
    }),
    ApiUnauthorizedResponse({
      description: DESCRIPT_UNAUTHORIZED_UPDATE_POST,
    }),
    ApiForbiddenResponse({
      description: DESCRIPT_FORBIDDEN_UPDATE_POST,
      type: DomainExceptionDto,
    }),
    ApiNotFoundResponse({
      description: DESCRIPT_NOT_FOUND_UPDATE_POST,
      type: DomainExceptionDto,
    }),
  );
}

export function CreatePostSwagger() {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: DESCRIPT_HEAD_CREATE_POST,
      description: DESCRIPT_DESC_CREATE_POST,
    }),
    ApiBody({
      type: CreateInputDto,
      description: 'Post data: optional description and location, required array of file IDs',
    }),
    ApiCreatedResponse({
      description: DESCRIPT_SUCCESS_CREATE_POST,
      type: PostByUserIdViewDto,
    }),
    ApiBadRequestResponse({
      description: DESCRIPT_BAD_REQUEST_CREATE_POST,
      type: DomainExceptionDto,
    }),
    ApiUnauthorizedResponse({
      description: DESCRIPT_UNAUTHORIZED_CREATE_POST,
    }),
  );
}
export function DeletePostSwagger() {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: DESCRIPT_HEAD_DELETE_POST,
      description: DESCRIPT_DESC_DELETE_POST,
    }),
    ApiParam({
      name: 'id',
      description: 'Post ID to delete',
      example: '65f4d9e2-3a3f-4c1e-9d78-6a81e8b2f9a1',
    }),
    ApiNoContentResponse({
      description: DESCRIPT_SUCCESS_DELETE_POST,
    }),
    ApiBadRequestResponse({
      description: DESCRIPT_BAD_REQUEST_DELETE_POST,
      type: DomainExceptionDto,
    }),
    ApiUnauthorizedResponse({
      description: DESCRIPT_UNAUTHORIZED_DELETE_POST,
    }),
    ApiForbiddenResponse({
      description: DESCRIPT_FORBIDDEN_DELETE_POST,
      type: DomainExceptionDto,
    }),
    ApiNotFoundResponse({
      description: DESCRIPT_NOT_FOUND_DELETE_POST,
      type: DomainExceptionDto,
    }),
  );
}
export function GetUserPostsPublicSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: DESCRIPT_HEAD_GET_USER_POSTS_PUBLIC,
      description: DESCRIPT_DESC_GET_USER_POSTS_PUBLIC,
    }),
    ApiParam({
      name: 'userId',
      description: 'User ID whose public posts should be returned',
      example: 'c7e1b8e3-3d7f-4a9a-b2f1-8d2c5b4f9a10',
    }),
    ApiOkResponse({
      description: DESCRIPT_SUCCESS_GET_USER_POSTS_PUBLIC,
      type: PostByUserIdViewDto,
      isArray: true,
    }),
    ApiBadRequestResponse({
      description: DESCRIPT_BAD_REQUEST_GET_USER_POSTS_PUBLIC,
      type: DomainExceptionDto,
    }),
    ApiNotFoundResponse({
      description: DESCRIPT_NOT_FOUND_GET_USER_POSTS_PUBLIC,
      type: DomainExceptionDto,
    }),
  );
}

export function GetPostByIdPublicSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: DESCRIPT_HEAD_GET_POST_BY_ID_PUBLIC,
      description: DESCRIPT_DESC_GET_POST_BY_ID_PUBLIC,
    }),
    ApiParam({
      name: 'postId',
      description: 'Post ID to fetch',
      example: '65f4d9e2-3a3f-4c1e-9d78-6a81e8b2f9a1',
    }),
    ApiOkResponse({
      description: DESCRIPT_SUCCESS_GET_POST_BY_ID_PUBLIC,
      type: PostByPostIdViewDto,
    }),
    ApiBadRequestResponse({
      description: DESCRIPT_BAD_REQUEST_GET_POST_BY_ID_PUBLIC,
      type: DomainExceptionDto,
    }),
    ApiNotFoundResponse({
      description: DESCRIPT_NOT_FOUND_GET_POST_BY_ID_PUBLIC,
      type: DomainExceptionDto,
    }),
  );
}
