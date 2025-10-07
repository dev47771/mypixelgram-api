import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CreateSessionDto } from '../../api/input-dto/create-session.input-dto';
import { Session } from '@prisma/client'

@Injectable()
export class SessionRepo {
  constructor(private prisma: PrismaService) {}

  async createSession(sessionDto: CreateSessionDto) {
    return this.prisma.session.create({ data: { ...sessionDto } });
  }

  async findByDeviceId(deviceId: string): Promise<Session | null> {
    return this.prisma.session.findFirst({ where: { deviceId } });
  }

  async deleteSession(id: string) {
    return this.prisma.session.delete({ where: { id } });
  }

  async updateSessionByDeviceId(deviceId: string, updateData: Partial<Session>) {
    return this.prisma.session.updateMany({
      where: { deviceId },
      data: { ...updateData }
    });
  }

}