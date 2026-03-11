import { Module } from '@nestjs/common';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { FilesController } from './api/files.controller';
import { ImageProcessingService } from './application/image-processing.service';
import { ImageCompressionAndValidationPipe } from '../../core/pipes/file-size-validation.pipe';
import { TransportModule } from '../transport/transport.module';
import { SetAvatarUrlUseCase } from './application/set-avatar-url.use-case';

@Module({
  imports: [UserAccountsModule, TransportModule],
  controllers: [FilesController],
  providers: [ImageProcessingService, ImageCompressionAndValidationPipe, SetAvatarUrlUseCase],
})
export class FileModule {}
