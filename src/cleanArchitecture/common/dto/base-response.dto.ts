import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class BaseResponseDto {
  @ApiProperty({ description: '성공여부' })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ description: '에러 데이터' })
  @IsOptional()
  error?: Error;

  @ApiProperty({ description: '메시지' })
  @IsString()
  @IsOptional()
  message?: string;
}
