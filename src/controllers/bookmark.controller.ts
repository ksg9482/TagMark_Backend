import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Logger, LoggerService, Param, ParseIntPipe, Patch, Post, Query, ValidationPipe } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AuthUser } from "src/auth/auth-user.decorator";
import { CreateBookmarkDto, CreateBookmarkResponseDto, EditBookmarkDto, EditBookmarkResponseDto, GetUserAllBookmarksDto, GetUserAllBookmarksResponseDto } from "src/controllers/dtos";
import { DeleteBookmarkResponseDto } from "src/controllers/dtos/bookmark/delete-bookmark.dto";
import { GetUserBookmarkCountResponseDto } from "src/controllers/dtos/bookmark/get-user-bookmark-count.dto";
import { Tag } from "src/frameworks/data-services/postgresql/model";
import { BookmarkUseCases, BookmarkFactoryService } from "src/use-cases/bookmark";
import { TagUseCases } from "src/use-cases/tag";

@ApiTags('Bookmark')
@Controller('api/bookmark')
export class BookmarkController {
    constructor(
        private bookmarkUseCases: BookmarkUseCases,
        private bookmarkFactoryService: BookmarkFactoryService,
        private tagUseCases: TagUseCases,
        @Inject(Logger) private readonly logger: LoggerService
    ) { }


    //페이지네이션 적용한 것도 만들어야 함
    @ApiOperation({ summary: '북마크를 생성하는 API', description: '북마크를 생성한다.' })
    @ApiCreatedResponse({ description: '북마크를 생성하고 결과를 반환한다.', type: CreateBookmarkResponseDto })
    @Post('/')
    async createBookmark(
        @AuthUser() userId: number,
        @Body(new ValidationPipe()) createBookmarkDto: CreateBookmarkDto
    ) {
        const createBookmarkResponse = new CreateBookmarkResponseDto();
        try {
            const bookmark = this.bookmarkFactoryService.createNewBookmark(createBookmarkDto);
            const createdBookmark = await this.bookmarkUseCases.createBookmark(userId, bookmark);
            let createdTags: Array<Tag>;
            if (createBookmarkDto.tagNames.length >= 0) {
                const tags = await this.tagUseCases.getTagsByNames(createBookmarkDto.tagNames)
                createdTags = tags;
                await this.tagUseCases.attachTag(userId, createdBookmark.id, tags)
            }
            const addTags = { ...createdBookmark, tags: createdTags || [] };
            createBookmarkResponse.success = true;
            createBookmarkResponse.createdBookmark = addTags;
            return createBookmarkResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: '해당 유저가 생성한 북마크를 반환하는 API', description: '유저가 생성한 모든 북마크를 반환한다.' })
    @ApiCreatedResponse({ description: '해당 유저가 생성한 북마크를 반환한다.', type: GetUserAllBookmarksResponseDto })
    @ApiQuery({ name: 'pageno', type: 'number', description: '페이지네이션 넘버. 1부터 시작하고 20개 단위이다.' })
    @Get('/')
    async getUserAllBookmark(
        @AuthUser() userId: number,
        @Query(new ValidationPipe({ transform: true })) page: GetUserAllBookmarksDto
    ) {
        const getUserAllBookmarkResponse = new GetUserAllBookmarksResponseDto();

        try {
            const bookmarks = await this.bookmarkUseCases.getUserAllBookmarks(
                userId,
                page
            );
            getUserAllBookmarkResponse.success = true;
            getUserAllBookmarkResponse.totalCount = bookmarks.totalCount
            getUserAllBookmarkResponse.totalPage = bookmarks.totalPage
            getUserAllBookmarkResponse.bookmarks = bookmarks.bookmarks;
            return getUserAllBookmarkResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //유저정보, 북마크 카운트, 태그 카운트 분리.
    //특히 태그는 태그 분석결과 넘겨줘야 함
    @ApiOperation({ summary: '유저가 생성한 북마크의 갯수를 반환하는 API', description: '북마크를 갯수를 반환한다.' })
    @ApiCreatedResponse({ description: '유저가 생성한 북마크의 갯수를 반환한다.', type: GetUserBookmarkCountResponseDto })
    @Get('/count')
    async getUserBookmarkCount(
        @AuthUser() userId: number,
    ) {
        const getUserAllBookmarkResponse = new GetUserBookmarkCountResponseDto()
        try {
            const count = await this.bookmarkUseCases.getUserBookmarkCount(userId);
            getUserAllBookmarkResponse.success = true;
            getUserAllBookmarkResponse.count = Number(count);
            return getUserAllBookmarkResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    @ApiOperation({ summary: '북마크의 데이터를 수정하는 API', description: '북마크의 데이터를 수정한다.' })
    @ApiCreatedResponse({ description: '북마크를 수정하고 Updated 메시지를 반환한다.', type: EditBookmarkResponseDto })
    @ApiParam({ name: 'id', description: '변경할 북마크 id' })
    @Patch('/:id')
    async editBookmark(
        @AuthUser() userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number,
        @Body(new ValidationPipe()) editBookmarkDto: EditBookmarkDto
    ) {
        const editBookmarkResponse = new EditBookmarkResponseDto()
        try {
            const changeUrl = editBookmarkDto.changeUrl;
            const deleteTag = editBookmarkDto.deleteTag?.length > 0 ? editBookmarkDto.deleteTag : null;
            const addTag = editBookmarkDto.addTag?.length > 0 ? editBookmarkDto.addTag : null;

            if (deleteTag || addTag) {
                if (deleteTag) {
                    const { message, deleteCount } = await this.tagUseCases.detachTag(userId, bookmarkId, deleteTag)
                }
                if (addTag) {
                    const tags = await this.tagUseCases.getTagsByNames(addTag)
                    const result = await this.tagUseCases.attachTag(userId, bookmarkId, tags)
                    //console.log(result)
                }
            }
            if (changeUrl) {
                await this.bookmarkUseCases.editBookmarkUrl(userId, bookmarkId, editBookmarkDto.changeUrl)
            }
            editBookmarkResponse.success = true;
            editBookmarkResponse.message = 'Updated';
            return editBookmarkResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: '북마크를 제거하는 API', description: '북마크를 제거한다.' })
    @ApiCreatedResponse({ description: '북마크를 제거하고 Deleted 메시지를 반환한다.', type: DeleteBookmarkResponseDto })
    @ApiParam({ name: 'id', description: '삭제할 북마크 id' })
    @Delete('/:id')
    async deleteBookmark(
        @AuthUser() userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number
    ) {
        const deleteBookmarkResponse = new DeleteBookmarkResponseDto()
        try {
            const result = await this.bookmarkUseCases.deleteBookmark(userId, bookmarkId)
            deleteBookmarkResponse.success = true;
            deleteBookmarkResponse.message = 'Deleted'
            return deleteBookmarkResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}