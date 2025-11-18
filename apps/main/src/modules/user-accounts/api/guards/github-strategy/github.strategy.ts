import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { VerifyCallback } from 'passport-oauth2';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID') as string,
      clientSecret: configService.get('GITHUB_CLIENT_SECRET') as string,
      callbackURL: configService.get('GITHUB_CALLBACK_URL') as string,
      scope: ['user:email'],
    });
  }
  async validate(accessToken: string, refreshToken: string, profile, done: VerifyCallback): Promise<void> {
    const { id, login, displayName, emails, photos } = profile;

    const user = {
      githubId: id,
      login,
      displayName,
      email: emails?.[0]?.value,
      avatar: photos?.[0]?.value, // Берем первую фотографию
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
