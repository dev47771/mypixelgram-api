import { ApiProperty } from '@nestjs/swagger';

export class SessionViewDto {
  @ApiProperty({ example: 'uuid' })
  sessionId: string;
  @ApiProperty({ example: 'uuid' })
  deviceId: string;

  @ApiProperty({
    description: 'Device model or OS name ',
    example: 'iPhone 14 Pro Max',
  })
  deviceName: string;

  @ApiProperty({
    description: 'Device type derived from user-agent',
    enum: ['mobile', 'desktop', 'tablet'],
  })
  deviceType: 'mobile' | 'desktop' | 'tablet';

  @ApiProperty({
    description: 'Browser name',
    example: 'Chrome',
  })
  browser: string;

  @ApiProperty({
    description: 'IP address of the session',
    example: '192.168.0.1',
  })
  ip: string;

  @ApiProperty({
    description: 'Last activity time (ISO 8601)',
  })
  lastActiveAt: string;

  @ApiProperty({
    description: 'Is this the current session',
  })
  isCurrent: boolean;

  static mapToView(
    session: {
      id: string;
      deviceName: string;
      deviceId: string;
      iat: string;
      ip: string;
    },
    currentDeviceId: string,
  ): SessionViewDto {
    const UAParser = require('ua-parser-js');
    const parser = new UAParser(session.deviceName);

    const { device, browser, os } = parser.getResult();

    const deviceName = (device.model || os.name) ?? 'Unknown';

    let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (device.type === 'mobile') deviceType = 'mobile';
    if (device.type === 'tablet') deviceType = 'tablet';

    return {
      deviceId: session.deviceId,
      sessionId: session.id,
      deviceName,
      deviceType,
      browser: browser.name || 'Unknown',
      ip: session.ip,
      lastActiveAt: session.iat,
      isCurrent: session.deviceId === currentDeviceId,
    };
  }
}

export class GetUserSessionsOutputDto {
  @ApiProperty({ type: [SessionViewDto] })
  sessions: SessionViewDto[];
}
