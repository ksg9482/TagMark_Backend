import { IsArray, IsOptional, IsString } from "class-validator";

export class EditBookmarkInputDto {
    @IsString()
    @IsOptional()
    //@ApiProperty({ description: '태그들'})
    changeUrl: string;

    @IsArray()
    @IsOptional()
    //@ApiProperty({ description: '태그 아이디 배열'})
    deleteTag:number[];
    
    @IsArray()
    @IsOptional()
    //@ApiProperty({ description: '태그 이름 배열. DB에 해당 태그가 있는지 모른다'})
    addTag:string[];
}

export class EditBookmarkOutputDto {}