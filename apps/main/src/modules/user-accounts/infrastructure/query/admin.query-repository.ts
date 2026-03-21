import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class AdminQueryRepository {
  constructor(private prismaService: PrismaService) {}
}
