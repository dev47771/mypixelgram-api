import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

export const TESTING_ROUTE = 'testing';

@Controller(TESTING_ROUTE)
export class TestingController {
  constructor(private prisma: PrismaService) {}

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

}
