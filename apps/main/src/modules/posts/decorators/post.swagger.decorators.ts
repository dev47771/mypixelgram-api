import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  DESCRIPT_BAD_REQUEST_LAST_POSTS,
  DESCRIPT_HEAD_LAST_POSTS,
  DESCRIPT_SUCCESS_LAST_POSTS,
} from './post.constants';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LastPostsResponseDto } from './dto';
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