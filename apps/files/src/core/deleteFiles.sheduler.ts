import { Injectable, Logger } from '@nestjs/common';
import { CleanSoftDeletedFilesUseCase } from '../files/application/use-cases/cleanSoftDeletedFiles.use-case';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DeleteFilesScheduler {
  private readonly logger = new Logger(DeleteFilesScheduler.name);

  constructor(private cleanSoftDeletedFilesUseCase: CleanSoftDeletedFilesUseCase) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleDailyFileClean() {
    this.logger.log('Starting daily Delete Files Scheduler...');
    await this.executeClean();
  }

  private async executeClean() {
    try {
      const result = await this.cleanSoftDeletedFilesUseCase.execute();

      if (result.cleanCount > 0) {
        this.logger.log(`File cleanup completed: ${result.cleanCount} files permanently deleted`);
      }

      if (result.failed.length > 0) {
        this.logger.warn(`Failed to purge ${result.failed.length} files`);
      }
    } catch (error) {
      this.logger.error('File cleanup failed:', error);
    }
  }
}
