import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExtractDeviceAndIpDto } from '../../modules/user-accounts/api/input-dto/extract-device-ip.input-dto';

export const ExtractUserFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): ExtractDeviceAndIpDto => {
    const request = context.switchToHttp().getRequest();

    const userId = request.user.id;
    const ip = request.ip;
    const device = request.headers['user-agent'];

    if (!userId) throw new Error('there is no user in the request object!');

    return {
      ip,
      device,
      userId,
    };
  },
);
