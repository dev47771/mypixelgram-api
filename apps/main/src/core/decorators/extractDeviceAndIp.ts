import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExtractDeviceAndIpDto } from '../../modules/user-accounts/api/input-dto/extract-device-ip.input-dto';

export const ExtractDeviceAndIpFromReq = createParamDecorator(
  (data: unknown, context: ExecutionContext): ExtractDeviceAndIpDto => {
    const request = context.switchToHttp().getRequest();

    const ip = request.ip
    const device = request.headers['user-agent']
    const userId = request.user

    console.log('ip ', ip)
    console.log('device ', device)
    console.log('userId ', userId)

    return {
      ip,
      device,
      userId
    };
  },
);
