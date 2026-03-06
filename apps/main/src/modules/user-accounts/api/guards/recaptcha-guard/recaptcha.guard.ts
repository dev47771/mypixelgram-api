import { RecaptchaService } from '../../../application/recaptcha.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ForbiddenDomainException } from '../../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../../core/exceptions/errorConstants';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(private recaptchaService: RecaptchaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.body.recaptchaToken;
    if (!token) {
      throw ForbiddenDomainException.create(
        ErrorConstants.RECAPTCHA_TOKEN_REQUIRED,
        'RecaptchaGuard',
      );
    }
    const isValid = await this.recaptchaService.verifyToken(token);
    if (!isValid) {
      throw ForbiddenDomainException.create(
        ErrorConstants.RECAPTCHA_VERIFICATION_FAILED,
        'RecaptchaGuard',
      );
    }

    return true;
  }
}
