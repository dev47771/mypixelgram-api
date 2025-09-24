import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { User as UserModel } from '@prisma/client';
import { NotFoundDomainException } from '../../../../core/exceptions/domainException';

@Injectable()
export class UsersQueryRepo {
  constructor(private prisma: PrismaService) {}

  async findByIdOrInternalFail(id: string): Promise<UserViewDto> {
    console.log('findByIdOrInternalFail', id);
    const user = await this.findById(id);

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    return user;
  }

  async findByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.findById(id);

    if (!user) {
      throw NotFoundDomainException.create('User not found', 'User');
    }

    return user;
  }

  async findById(id: string): Promise<UserViewDto | null> {
    const user: UserModel | null = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    return user ? UserViewDto.mapToView(user) : null;
  }
}
