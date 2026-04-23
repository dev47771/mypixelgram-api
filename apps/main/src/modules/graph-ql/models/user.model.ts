import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { $Enums } from '@prisma/client';

export class User {
  constructor() {}
}
// Регистрируем enum для GraphQL
registerEnumType($Enums.AccountType, {
  name: 'AccountType',
  description: 'User account type',
});

@ObjectType()
export class CurrentSubscription {
  @Field()
  planName: string;

  @Field()
  expiresAt: string;

  @Field()
  nextPayment: string;
}

@ObjectType()
export class Profile {
  @Field()
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => String, { nullable: true })
  dateOfBirth: string | null;

  @Field(() => String, { nullable: true })
  country: string | null;

  @Field(() => String, { nullable: true })
  city: string | null;

  @Field(() => String, { nullable: true })
  aboutMe: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;

  @Field(() => String, { nullable: true })
  fileId: string | null;
}

@ObjectType()
export class BlockInfo {
  @Field(() => Number, { nullable: true })
  reasonId: number;

  @Field(() => String, { nullable: true })
  reasonDetail: string;
}

@ObjectType()
export class UserModel {
  @Field()
  id: string;

  @Field()
  login: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  provider: string | null;

  @Field()
  createdAt: string;

  @Field(() => $Enums.AccountType)
  accountType: $Enums.AccountType;

  @Field(() => CurrentSubscription, { nullable: true })
  currentSubscription: CurrentSubscription | null;

  @Field(() => Profile, { nullable: true })
  profile: Profile | null;

  @Field(() => BlockInfo, { nullable: true })
  blockInfo: BlockInfo | null;

  static mapToView(user: any) {
    const dto = new UserModel();

    dto.id = user.id;
    dto.login = user.login;
    dto.email = user.email;
    dto.provider = user.provider ?? null;
    dto.createdAt = user.createdAt.toISOString();
    dto.accountType = user.accountType;

    if (user.currentSubscription) {
      dto.currentSubscription = {
        planName: user.currentSubscription.planName,
        expiresAt: user.currentSubscription.expiresAt.toISOString(),
        nextPayment: user.currentSubscription.nextPayment.toISOString(),
      };
    } else {
      dto.currentSubscription = null;
    }

    if (user.profile) {
      dto.profile = {
        id: user.profile.id,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        dateOfBirth: user.profile.dateOfBirth?.toISOString() ?? null,
        country: user.profile.country ?? null,
        city: user.profile.city ?? null,
        aboutMe: user.profile.aboutMe ?? null,
        avatarUrl: user.profile.avatarUrl ?? null,
        fileId: user.profile.fileId ?? null,
      };
    } else {
      dto.profile = null;
    }

    if (user.blockInfo) {
      dto.blockInfo = {
        reasonId: user.blockInfo.reasonId,
        reasonDetail: user.blockInfo.reasonDetail,
      };
    } else {
      dto.blockInfo = null;
    }

    return dto;
  }
}
