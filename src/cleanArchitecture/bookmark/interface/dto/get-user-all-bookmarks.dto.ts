import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";
import { Bookmark } from "src/cleanArchitecture/bookmark/domain/bookmark";
import { PageRequest } from "src/use-cases/bookmark/bookmark.pagination";
import { BaseResponseDto } from "src/cleanArchitecture/common/dto/base-response.dto";

export class GetUserAllBookmarksDto extends PageRequest {}

export class GetUserAllBookmarksResponseDto extends BaseResponseDto {
    @ApiProperty({ description: '페이지네이션 페이지 수'})
    @IsNumber()
    totalPage:number;

    @ApiProperty({ description: '총 북마크 수'})
    @IsNumber()
    totalCount:number;

    @ApiProperty({ description: '북마크 배열', type:[Bookmark]})
    @IsArray()
    bookmarks:Bookmark[];
}