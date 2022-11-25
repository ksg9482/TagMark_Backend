import { IsArray, IsOptional, IsString } from "class-validator";
import { BaseResponseDto } from "../common";

export class EditTagDto {
    @IsString()
    //@ApiProperty({ description: '태그명'})
    changeTag: string;
}


export class EditTagResponseDto extends BaseResponseDto {
}