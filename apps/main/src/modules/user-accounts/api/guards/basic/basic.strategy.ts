import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(private configService: ConfigService) {
    super();
  }

  async validate(username: string, password: string): Promise<boolean> {
    if (
      username === this.configService.get('HTTP_BASIC_USER') &&
      password === this.configService.get('HTTP_BASIC_PASS')
    ) {
      return true;
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
