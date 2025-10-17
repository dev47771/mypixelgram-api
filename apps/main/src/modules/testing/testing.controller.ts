import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserViewDto } from '../user-accounts/api/view-dto/user.view-dto';

export const TESTING_ROUTE = 'testing';

@Controller(TESTING_ROUTE)
export class TestingController {
  constructor(private prisma: PrismaService) {}

  @ApiOperation({
    summary: 'Clear database',
    description: 'Delete all data from all tables/collections',
  })
  @ApiResponse({
    status: 204,
    description: 'All data is deleted',
  })
  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll(): Promise<void> {
    const tables = await this.prisma.$queryRaw<
      { tablename: string }[]
    >`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`;

    for (const { tablename } of tables) {
      if (tablename !== '_prisma_migrations') {
        try {
          await this.prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`,
          );
        } catch (error) {
          console.log(`Skipping ${tablename}`, error);
        }
      }
    }
  }

  async deleteAll1(): Promise<void> {
    await this.prisma.$transaction([this.prisma.user.deleteMany({})]);
  }
}
