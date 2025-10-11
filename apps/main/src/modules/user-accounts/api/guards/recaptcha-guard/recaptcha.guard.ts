import { RecaptchaService } from '../../../application/recaptcha.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ForbiddenDomainException } from '../../../../../core/exceptions/domainException';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(private recaptchaService: RecaptchaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.body.recaptchaToken;
    if (!token) {
      throw ForbiddenDomainException.create(
        'reCAPTCHA token is required',
        'reCAPTCHA',
      );
    }
    const isValid = await this.recaptchaService.verifyToken(token);
    if (!isValid) {
      throw new ForbiddenException('Recaptcha verification failed');
    }

    return true;
  }
}
