import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';

@Injectable()
export class CryptoService {
  async createPasswordHash(password: string): Promise<string> {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  }

  async comparePasswords(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, passwordHash);
  }

  createPasswordRecoveryCodeHash(recoveryCode: string): string {
    return createHash('sha256').update(recoveryCode).digest('hex');
  }
}
