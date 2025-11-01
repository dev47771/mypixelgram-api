import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class PostsRepo {
  constructor(private prisma: PrismaService) {
  }
}
