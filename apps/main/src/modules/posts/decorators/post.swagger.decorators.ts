import { applyDecorators, HttpStatus } from '@nestjs/common';
import { DESCRIPT_BAD_REQUEST_MY_POSTS, DESCRIPT_CURSOR_MY_POSTS, DESCRIPT_DESC_MY_POSTS, DESCRIPT_HEAD_LAST_POSTS, DESCRIPT_HEAD_MY_POSTS, DESCRIPT_SUCCESS_LAST_POSTS, DESCRIPT_SUCCESS_MY_POSTS, DESCRIPT_UNAUTHORIZED_MY_POSTS } from './post.constants';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LastPostsResponseDto, UserPostsInfiniteResponseDto } from './dto';
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
