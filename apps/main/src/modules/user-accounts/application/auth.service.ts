import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User as UserModel } from '@prisma/client';
import { UsersRepo } from '../infrastructure/users.repo';
import { NotFoundDomainException } from '../../../core/exceptions/domain/domainException';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepo: UsersRepo,
  ) {}

  async githubLogin(user: any) {
    if (!user) {
      throw NotFoundDomainException.create('User not found', 'githibLogin');
    }

    const foundUser: UserModel | null = await this.userRepo.findByEmail(
      user.email,
    );
    if (!foundUser) {
    }

    // Здесь вы можете
    // 1. Проверить, существует ли пользователь в вашей БД
    // 2. Создать нового пользователя, если не существует
    // 3. Обновить информацию существующего пользователя

    const payload = {
      sub: user.githubId,
      username: user.username,
      email: user.email,
    };

    // const newUser: {
    //   id: user.githubId;
    //   username: user.username;
    //   email: user.email;
    //   avatar: user.avatar;
    //   displayName: user.displayName;
    // };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
