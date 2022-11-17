import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class GetUserAllBookmarksInputDto {
    @IsNumber()
    //@ApiProperty({ description: 'URL '})
    bookmarkId: number;

    
    @IsString()
    //@ApiProperty({ description: '태그들'})
    changeUrl: string;
}

export class GetUserAllBookmarksOutputDto {}