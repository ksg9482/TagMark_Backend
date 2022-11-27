import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, ValidationPipe } from "@nestjs/common";
import { AuthUser } from "src/auth/auth-user.decorator";
import { CreateTagDto, CreateTagResponseDto, DeleteTagResponseDto, EditTagDto, EditTagResponseDto, GetUserAllTagsResponseDto } from "src/core/dtos";
import { GetAllTagsResponseDto } from "src/core/dtos/tag/get-all-tags.dto";
import { GetSearchTagsResponseDto } from "src/core/dtos/tag/get-search-tags.dto copy";
import { TagFactoryService, TagUseCases } from "src/use-cases/tag";

@Controller('api/tag')
export class TagController {
    constructor(
        private tagUseCases:TagUseCases,
        private tagFactoryService:TagFactoryService
    ) {};


    @Post('/')
    async createTag(
        @AuthUser() userId:number,
        @Body(new ValidationPipe()) createTagDto: CreateTagDto
    ) {
        const createTagResponse = new CreateTagResponseDto();
        try {
            //문자열 배열 받으면 바로 find or create돌리는게 좋지 않을까?
            const tag = this.tagFactoryService.createNewTag(createTagDto);
            const createdTag = await this.tagUseCases.createTag(userId, createTagDto)
            createTagResponse.success = true;
            createTagResponse.createdTag = createdTag;
        } catch (error) {
            console.log(error)
            createTagResponse.success = false;
        }
        return createTagResponse;
    };

    @Get('/all')
    async getAllTag() {
        const getAllTagsResponse = new GetAllTagsResponseDto()
        try {
            const tags = await this.tagUseCases.getAllTags();
            getAllTagsResponse.success = true;
            getAllTagsResponse.tags = tags;
        } catch (error) {
            console.log(error)
            getAllTagsResponse.success = false;
        }
        return getAllTagsResponse;
    };

    //유저가 가진 모든 태그 + 페이지네이션
    @Get('/')
    async getUserAllTags(
        @AuthUser() userId:number,
    ) {
        const getUserAllTagsResponse = new GetUserAllTagsResponseDto()
        try {
            const tags = await this.tagUseCases.getUserAllTags(userId);
            getUserAllTagsResponse.success = true;
            getUserAllTagsResponse.tags = tags;
        } catch (error) {
            getUserAllTagsResponse.success = false;
            console.log(error)
        }
        return getUserAllTagsResponse;
    };

    //'태그에 해당하는 북마크를 반환. 찾는게 태그니 태그책임? 결과가 북마크니 북마크 책임? 단순히 태그랑 북마크로 나눠놓은게 도메인영역을 자꾸 침범한다.
    //검색용. 배열이용. AND검색. 태그에 해당하는 모든 북마크. 태그랑 북마크랑 책임 나눠야함
    @Get('/search-and')
    async andFindTagAndBookmarks(
        @AuthUser() userId:number,
        @Query('tags') tags: string
    ) {
        //tags -> 태그1+태그2
        const getSearchTagsResponseDto = new GetSearchTagsResponseDto()
        try {
            const tagArr = tags.split(' ') //태그 식별을 정확히 +로 해야함. 태그를 미리 ""로 감싸나? -> split('"+"') 이럼 양옆 ""이 짤릴수도?
            
            const bookmarks = await this.tagUseCases.getTagAllBookmarksAND(userId, tagArr)
            getSearchTagsResponseDto.success = true;
            getSearchTagsResponseDto.bookmarks = bookmarks
        } catch (error) {
            console.log(error)
            getSearchTagsResponseDto.success = false;
        }
        return getSearchTagsResponseDto;
    };

    //검색용. 배열이용. OR검색. 태그에 해당하는 모든 북마크. 태그랑 북마크랑 책임 나눠야함
    @Get('/search-or')
    async orFindTagAndBookmarks(
        @AuthUser() userId:number,
        @Query('tags') tags: string
    ) {
        //tags -> 태그1OR태그2
        const getSearchTagsResponseDto = new GetSearchTagsResponseDto()
        try {
            const tagArr = tags.split(' ') //태그 식별을 정확히 +로 해야함. 태그를 미리 ""로 감싸나? -> split('"+"') 이럼 양옆 ""이 짤릴수도?
            const bookmarks = await this.tagUseCases.getTagAllBookmarksOR(userId, tagArr)
            getSearchTagsResponseDto.success = true;
            getSearchTagsResponseDto.bookmarks = bookmarks
        } catch (error) {
            getSearchTagsResponseDto.success = false;
        }
        return getSearchTagsResponseDto;
    };
    

    @Patch('/:id')
    async editTag(
        @AuthUser() userId:number,
        @Param('id', ParseIntPipe) tagId: number,
        @Body(new ValidationPipe()) editTagDto: EditTagDto
    ) {
        const editTagResponseDto = new EditTagResponseDto()
        try {
            const editTag = await this.tagUseCases.editTag(userId, tagId, editTagDto);
            editTagResponseDto.success = true;
            editTagResponseDto.message = 'Updated';
        } catch (error) {
            console.log(error)
            editTagResponseDto.success = false;
        }
        return editTagResponseDto;
    };

    //북마크 안에있는 태그를 지움. 근데 이 id가 북마크인지 태그인지 직관적으로 알 수 있을까?
    @Delete('/:bookmark_id')
    async detachTag(
        @AuthUser() userId:number,
        @Param('bookmark_id', ParseIntPipe) bookmarkId: number,
        @Query('tag_ids') tagIds: number[]
    ) {
        const deleteTagResponse = new DeleteTagResponseDto()
        try {
            //const userId = 1
            //태그를 진짜 지우는게 아니라 연결을 끊는다. bookmarks_tags. detach로 하면 될까?
            const result = await this.tagUseCases.detachTag(userId, bookmarkId, tagIds)
            deleteTagResponse.success = true;
            deleteTagResponse.message = 'Deleted';
        } catch (error) {
            deleteTagResponse.success = false;
            console.log(error);
        }
        return deleteTagResponse;
    };
}