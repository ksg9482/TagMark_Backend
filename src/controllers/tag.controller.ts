import { Body, Controller, Delete, Get, Inject, Logger, LoggerService, Param, ParseIntPipe, Patch, Post, Query, ValidationPipe } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AuthUser } from "src/auth/auth-user.decorator";
import { CreateTagDto, CreateTagResponseDto, DeleteTagResponseDto, EditTagDto, EditTagResponseDto, GetUserAllTagsResponseDto } from "src/controllers/dtos";
import { GetAllTagsResponseDto } from "src/controllers/dtos/tag/get-all-tags.dto";
import { GetSearchTagsDto, GetSearchTagsResponseDto } from "src/controllers/dtos/tag/get-search-tags.dto copy";
import { TagFactoryService, TagUseCases } from "src/use-cases/tag";

@ApiTags('Tag')
@Controller('api/tag')
export class TagController {
    constructor(
        private tagUseCases:TagUseCases,
        private tagFactoryService:TagFactoryService,
        @Inject(Logger) private readonly logger: LoggerService
    ) {};


    @ApiOperation({ summary: '태그를 생성하는 API', description: '태그를 생성한다.' })
    @ApiCreatedResponse({ description: '태그를 생성하고 결과를 반환한다.', type: CreateTagResponseDto })
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
            this.logger.debug(error)
            createTagResponse.success = false;
        }
        return createTagResponse;
    };

    @ApiOperation({ summary: '모든 태그를 반환하는 API', description: '모든 태그를 반환한다.' })
    @ApiCreatedResponse({ description: '존재하는 모든 태그를 반환한다.', type: GetAllTagsResponseDto })
    @Get('/all')
    async getAllTag() {
        const getAllTagsResponse = new GetAllTagsResponseDto()
        try {
            const tags = await this.tagUseCases.getAllTags();
            getAllTagsResponse.success = true;
            getAllTagsResponse.tags = tags;
        } catch (error) {
            this.logger.debug(error)
            getAllTagsResponse.success = false;
        }
        return getAllTagsResponse;
    };

    
    @ApiOperation({ summary: '유저가 생성한 모든 태그를 반환하는 API', description: '유저가 생성한 모든 태그를 반환한다.' })
    @ApiCreatedResponse({ description: '유저가 생성한 모든 태그를 반환한다.', type: GetUserAllTagsResponseDto })
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
            this.logger.debug(error)
        }
        return getUserAllTagsResponse;
    };
    //[{tag1:12},{tag2:4}...] //이거 사실상 안쓰임.
    @ApiOperation({ summary: '유저가 생성한 태그의 갯수를 반환하는 API', description: '모든 태그의 갯수를 반환한다.' })
    @ApiCreatedResponse({ description: '유저가 생성한 모든 태그의 갯수를 반환한다.', type: GetUserAllTagsResponseDto })
    @Get('/count')
    async getUserTagCount(
        @AuthUser() userId:number,
    ) {
        const getUserAllTagsResponse = new GetUserAllTagsResponseDto()
        try {
            const tags = await this.tagUseCases.getUserAllTags(userId); //이거 안바꿨음
            getUserAllTagsResponse.success = true;
            getUserAllTagsResponse.tags = tags;
        } catch (error) {
            this.logger.debug(error)
            getUserAllTagsResponse.success = false;
        }
        return getUserAllTagsResponse;
    };

    //'태그에 해당하는 북마크를 반환. 찾는게 태그니 태그책임? 결과가 북마크니 북마크 책임? 단순히 태그랑 북마크로 나눠놓은게 도메인영역을 자꾸 침범한다.
    //검색용. 배열이용. AND검색. 태그에 해당하는 모든 북마크. 태그랑 북마크랑 책임 나눠야함
    @ApiOperation({ summary: '여러 태그를 AND 검색하는 API', description: '입력한 모든 태그를 만족하는 북마크를 반환한다.' })
    @ApiCreatedResponse({ description: '모든 태그를 만족하는 북마크를 반환한다.', type: GetSearchTagsResponseDto })
    @ApiQuery({name:'tags', type:'string', description:'검색할 태그 문자열. ","로 split한다.'})
    @ApiQuery({name:'pageno', type:'number', description:'페이지네이션 넘버. 1부터 시작하고 20개 단위이다.'})
    @Get('/search-and')
    async andFindTagAndBookmarks(
        @AuthUser() userId:number,
        @Query('tags') tags: string,
        @Query(new ValidationPipe({transform:true})) page: GetSearchTagsDto
    ) {
        //tags -> 태그1+태그2
        const getSearchTagsResponseDto = new GetSearchTagsResponseDto()
        try {
            const tagArr = tags.split(',') //태그 식별을 정확히 +로 해야함. 태그를 미리 ""로 감싸나? -> split('"+"') 이럼 양옆 ""이 짤릴수도?
            const bookmarks = await this.tagUseCases.getTagAllBookmarksAND(userId, tagArr, page)
            getSearchTagsResponseDto.success = true;
            getSearchTagsResponseDto.totalCount = bookmarks.totalCount
            getSearchTagsResponseDto.totalPage = bookmarks.totalPage
            getSearchTagsResponseDto.bookmarks = bookmarks.bookmarks
        } catch (error) {
            this.logger.debug(error)
            getSearchTagsResponseDto.success = false;
        }
        return getSearchTagsResponseDto;
    };

    //검색용. 배열이용. OR검색. 태그에 해당하는 모든 북마크. 태그랑 북마크랑 책임 나눠야함
    @ApiOperation({ summary: '여러 태그를 OR 검색하는 API', description: '입력한 일부 태그를 만족하는 북마크를 반환한다.' })
    @ApiCreatedResponse({ description: '일부 태그를 만족하는 북마크를 반환한다.', type: GetSearchTagsResponseDto })
    @ApiQuery({name:'tags', type:'string', description:'검색할 태그 문자열. ","로 split한다.'})
    @ApiQuery({name:'pageno', type:'number', description:'페이지네이션 넘버. 1부터 시작하고 20개 단위이다.'})
    @Get('/search-or')
    async orFindTagAndBookmarks(
        @AuthUser() userId:number,
        @Query('tags') tags: string,
        @Query(new ValidationPipe({transform:true})) page: GetSearchTagsDto
    ) {
        const getSearchTagsResponseDto = new GetSearchTagsResponseDto()
        try {
            const tagArr = tags.split(',') //태그 식별을 정확히 +로 해야함. 태그를 미리 ""로 감싸나? -> split('"+"') 이럼 양옆 ""이 짤릴수도?
            const bookmarks = await this.tagUseCases.getTagAllBookmarksOR(userId, tagArr, page)
            getSearchTagsResponseDto.success = true;
            getSearchTagsResponseDto.totalCount = bookmarks.totalCount
            getSearchTagsResponseDto.totalPage = bookmarks.totalPage
            getSearchTagsResponseDto.bookmarks = bookmarks.bookmarks
        } catch (error) {
            this.logger.debug(error)
            getSearchTagsResponseDto.success = false;
        }
        return getSearchTagsResponseDto;
    };
    
    @ApiOperation({ summary: '태그 데이터를 수정하는 API', description: '태그를 수정한다.' })
    @ApiCreatedResponse({ description: '태그를 수정하고 Updated 메시지를 반환한다.', type: EditTagResponseDto })
    @ApiParam({name:'id', type:'number', description:'수정할 태그 id'})
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
            this.logger.debug(error)
            editTagResponseDto.success = false;
        }
        return editTagResponseDto;
    };

    //이것도 사실상 안쓰임? 북마크 수정할때 detachTag 불러와서 다 처리됨
    //북마크 안에있는 태그를 지움. 근데 이 id가 북마크인지 태그인지 직관적으로 알 수 있을까?
    @ApiOperation({ summary: '북마크에 등록된 태그를 삭제하는 API', description: '북마크에 등록된 태그를 삭제한다.' })
    @ApiCreatedResponse({ description: '북마크에 등록된 태그를 삭제하고 Deleted 메시지를 반환한다.', type: DeleteTagResponseDto })
    @ApiParam({name:'bookmark_id', type:'number', description:'삭제할 태그가 있는 북마크 id'})
    @ApiQuery({name:'tag_ids', type:'Array<number>'})
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
            this.logger.debug(error);
            deleteTagResponse.success = false;
        }
        return deleteTagResponse;
    };
}