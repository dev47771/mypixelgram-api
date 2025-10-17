// google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID') as string,
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET') as string,
      callbackURL: configService.get('GOOGLE_CALLBACK_URL') as string,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }
  authorizationParams(): Record<string, string> {
    return { prompt: 'select_account' };
  }
  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, displayName, emails, photos } = profile;
    const username = (emails && emails[0].value.split('@')[0]) || 'unknown';

    const user = {
      googleId: id,
      displayName,
      username,
      email: emails?.[0]?.value,
      avatar: photos?.[0]?.value,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
