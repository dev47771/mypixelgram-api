import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExtractDeviceAndIpDto } from '../../modules/user-accounts/api/input-dto/extract-device-ip.input-dto';

export const ExtractDeviceAndIpFromReq = createParamDecorator(
  (data: unknown, context: ExecutionContext): ExtractDeviceAndIpDto => {
    const request = context.switchToHttp().getRequest();

    const ip = request.ip
    const device = request.headers['user-agent']

    return {
      ip,
      device
    };
  },
);
