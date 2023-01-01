import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Logger, LoggerService, Param, ParseIntPipe, Patch, Post, Query, ValidationPipe } from "@nestjs/common";
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
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
    @ApiBody({type:CreateTagDto})
    @Post('/')
    async createTag(
        @AuthUser() userId:number,
        @Body(new ValidationPipe()) createTagDto: CreateTagDto
    ) {
        const createTagResponse = new CreateTagResponseDto();
        try {
            const tag = this.tagFactoryService.createNewTag(createTagDto);
            //위의 태그는 의미있나?
            const createdTag = await this.tagUseCases.createTag(userId, tag)
            createTagResponse.success = true;
            createTagResponse.createdTag = createdTag;
            return createTagResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
            return getAllTagsResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
            return getUserAllTagsResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    };

    @ApiOperation({ summary: '유저가 생성한 태그의 갯수를 반환하는 API', description: '모든 태그의 갯수를 반환한다.' })
    @ApiCreatedResponse({ description: '유저가 생성한 모든 태그의 갯수를 반환한다.', type: GetUserAllTagsResponseDto })
    @Get('/count')
    async getUserTagCount(
        @AuthUser() userId:number,
    ) {
        const getUserAllTagsResponse = new GetUserAllTagsResponseDto()
        try {
            const tags = await this.tagUseCases.getUserAllTags(userId); 
            
            getUserAllTagsResponse.success = true;
            getUserAllTagsResponse.tags = tags;
            return getUserAllTagsResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    };

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
        const getSearchTagsResponseDto = new GetSearchTagsResponseDto()
        try {
            const tagArr = tags.split(',') 
            
            const bookmarks = await this.tagUseCases.getTagAllBookmarksAND(userId, tagArr, page)
            
            getSearchTagsResponseDto.success = true;
            getSearchTagsResponseDto.totalCount = bookmarks.totalCount
            getSearchTagsResponseDto.totalPage = bookmarks.totalPage
            getSearchTagsResponseDto.bookmarks = bookmarks.bookmarks
            return getSearchTagsResponseDto;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    };

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
            return getSearchTagsResponseDto;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    };
    
    @ApiOperation({ summary: '태그 데이터를 수정하는 API', description: '태그를 수정한다.' })
    @ApiCreatedResponse({ description: '태그를 수정하고 Updated 메시지를 반환한다.', type: EditTagResponseDto })
    @ApiParam({name:'id', type:'number', description:'수정할 태그 id'})
    @ApiBody({type:EditTagDto})
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
            return editTagResponseDto;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    };

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
            const result = await this.tagUseCases.detachTag(userId, bookmarkId, tagIds)
            
            deleteTagResponse.success = true;
            deleteTagResponse.message = 'Deleted';
            return deleteTagResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    };
}