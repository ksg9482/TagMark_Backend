import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsObject } from "class-validator";
import { Bookmark } from "src/cleanArchitecture/bookmark/domain/bookmark";
import { BaseResponseDto } from "src/cleanArchitecture/common/dto/base-response.dto";

export class GetBookmarkDto {
    @IsNumber()
    @ApiProperty({ description: '북마크 아이디'})
    bookmarkId: number
}

export class GetBookmarkResponseDto extends BaseResponseDto {
    @ApiProperty({ description: '북마크'})
    @IsObject()
    bookmark: Bookmark;
}