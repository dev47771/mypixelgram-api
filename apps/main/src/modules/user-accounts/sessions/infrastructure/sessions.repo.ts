import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CreateSessionDto } from '../../api/input-dto/create-session.input-dto';

@Injectable()
export class SessionRepo {
  constructor(private prisma: PrismaService) {}

  async createSession(sessionDto: CreateSessionDto) {
    return this.prisma.session.create({ data: {...sessionDto} });
  }
}