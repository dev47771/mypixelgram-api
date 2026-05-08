import { PrismaService } from '../../../core/prisma/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { UsersRepo } from '../infrastructure/users.repo';

@Injectable()
export class LoginGenerateService {
  constructor(
    private prisma: PrismaService,
    private userRepo: UsersRepo,
  ) {}

  async generateUniqueLogin(baseLogin: string): Promise<string> {
    let candidate = baseLogin;
    let counter = 1;
    const maxAttempts = 100;

    while (counter <= maxAttempts) {
      const existingUser = await this.userRepo.findByLogin(candidate);

      if (!existingUser) {
        return candidate;
      }

      candidate = `${baseLogin}${counter}`;
      counter++;
    }

    throw new ConflictException(
      `Cannot generate unique login for "${baseLogin}" after ${maxAttempts} attempts`,
    );
  }
}
