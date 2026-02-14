import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOrUpdateProfileDto {
  @ApiProperty({
    example: 'user123',
    description: 'Login of the current user. Must match the login in their account.',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(30)
  @IsNotEmpty()
  login: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: '1999-04-20T00:00:00.000Z',
    description: 'Date of birth in ISO string format (UTC).',
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({
    example: 'Azerbaijan',
    required: false,
    description: 'Country (optional).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiProperty({
    example: 'Baku',
    required: false,
    description: 'City (optional).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({
    example: 'About me...',
    required: false,
    description: 'Short bio/about me (optional).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  aboutMe?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;
}
