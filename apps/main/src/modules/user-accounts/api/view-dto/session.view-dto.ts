import { ApiProperty } from '@nestjs/swagger';

export class SessionViewDto {
  @ApiProperty({ example: 'uuid' })
  sessionId: string;

  @ApiProperty({
    description: 'Raw user-agent string',
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
    description: 'Operating system name',
    example: 'Windows',
  })
  os: string;

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
    },
    currentDeviceId: string,
  ): SessionViewDto {
    const UAParser = require('ua-parser-js');

    const parser = new UAParser(session.deviceName);
    const result = parser.getResult();

    return {
      sessionId: session.id,
      deviceName: session.deviceName,
      deviceType: (result.device.type ?? 'desktop') as 'mobile' | 'desktop' | 'tablet',
      browser: result.browser.name ?? 'Unknown',
      os: result.os.name ?? 'Unknown',
      lastActiveAt: session.iat,
      isCurrent: session.deviceId === currentDeviceId,
    };
  }
}

export class GetUserSessionsOutputDto {
  @ApiProperty({ type: [SessionViewDto] })
  sessions: SessionViewDto[];
}
