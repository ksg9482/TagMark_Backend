import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class BaseResponseDto {
    @ApiProperty({ description: '성공여부'})
    @IsBoolean()
    success: boolean;

    @ApiProperty({ description: '에러 데이터', nullable:true})
    @IsOptional()
    error?: Error;

    @ApiProperty({ description: '메시지', nullable:true})
    @IsString()
    @IsOptional()
    message?: string
}