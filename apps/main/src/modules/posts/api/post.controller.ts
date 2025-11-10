import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { POST_ROUTE } from '../../user-accounts/domain/constants';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../user-accounts/api/guards/jwt-strategy/jwt-auth.guard';
import { PostInputDto } from './input-dto/post.input.dto';
import { UpdatePostCommand } from '../application/update-post.use-case';
import { ImageCompressionAndValidationPipe } from '../../../core/pipes/file-size-validation.pipe';

@Controller(POST_ROUTE)
export class PostController {
  constructor(private commandBus: CommandBus) {}
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async updatePostById(@Body() updatePostDto: PostInputDto, @Param('id') postId: string) {
    return this.commandBus.execute(new UpdatePostCommand(updatePostDto, postId));
  }

  @Post('upload-images')
  @UseInterceptors(FilesInterceptor('post images', 10))
  async uploadImages(@UploadedFiles(new ImageCompressionAndValidationPipe(5, 70)) files: Express.Multer.File[]) {
    return { success: true, filesCount: files.length };
  }
}
