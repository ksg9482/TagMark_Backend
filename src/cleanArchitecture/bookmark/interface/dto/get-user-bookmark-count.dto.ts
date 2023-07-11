import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { BaseResponseDto } from "src/cleanArchitecture/common/dto/base-response.dto";

export class GetUserBookmarkCountDto {
}

export class GetUserBookmarkCountResponseDto extends BaseResponseDto {
    @ApiProperty({ description: '유저의 전체 북마크 수'})
    @IsNumber()
    count:number
}