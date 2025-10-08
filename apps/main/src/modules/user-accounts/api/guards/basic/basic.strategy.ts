import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedDomainException } from '../../../../../core/exceptions/domainException';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(private configService: ConfigService) {
    super();
  }

  async validate(username: string, password: string): Promise<boolean> {
    console.log('username', username);
    console.log('password', password);
    console.log(
      "this.configService.get('HTTP_BASIC_USER')",
      this.configService.get('HTTP_BASIC_USER'),
    );
    console.log(
      "this.configService.get('HTTP_BASIC_PASS')",
      this.configService.get('HTTP_BASIC_PASS'),
    );
    if (
      username === this.configService.get('HTTP_BASIC_USER') &&
      password === this.configService.get('HTTP_BASIC_PASS')
    ) {
      return true;
    }
    throw UnauthorizedDomainException.create('Invalid credentials', 'basic');
  }
}
