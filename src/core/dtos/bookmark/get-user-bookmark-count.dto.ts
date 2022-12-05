import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";
import { Bookmark } from "src/core/entities";
import { BaseResponseDto } from "../common";

export class GetUserBookmarkCountDto {
}

export class GetUserBookmarkCountResponseDto extends BaseResponseDto {
    count:number
}