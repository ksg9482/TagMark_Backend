import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Logger, LoggerService, Param, ParseIntPipe, Patch, Post, Query, ValidationPipe } from "@nestjs/common";
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AuthUser } from "src/auth/auth-user.decorator";
import { CreateBookmarkDto, CreateBookmarkResponseDto, EditBookmarkDto, EditBookmarkResponseDto, GetUserAllBookmarksDto, GetUserAllBookmarksResponseDto } from "src/controllers/dtos";
import { DeleteBookmarkResponseDto } from "src/controllers/dtos/bookmark/delete-bookmark.dto";
import { GetUserBookmarkCountResponseDto } from "src/controllers/dtos/bookmark/get-user-bookmark-count.dto";
import { Bookmark, Tag } from "src/frameworks/data-services/postgresql/model";
import { BookmarkUseCases, BookmarkFactoryService } from "src/use-cases/bookmark";
import { TagUseCases } from "src/use-cases/tag";
import { UtilsService } from "src/utils/utils.service";
import { SyncBookmarkDto, SyncBookmarkResponseDto } from "./dtos/bookmark/sync-bookmark.dto";

@ApiTags('Bookmark')
@Controller('api/bookmark')
export class BookmarkController {
    constructor(
        private bookmarkUseCases: BookmarkUseCases,
        private bookmarkFactoryService: BookmarkFactoryService,
        private tagUseCases: TagUseCases,
        private readonly utilServices: UtilsService,
        @Inject(Logger) private readonly logger: LoggerService
    ) { }


    @ApiOperation({ summary: '북마크를 생성하는 API', description: '북마크를 생성한다.' })
    @ApiCreatedResponse({ description: '북마크를 생성하고 결과를 반환한다.', type: CreateBookmarkResponseDto })
    @ApiBody({type:CreateBookmarkDto})
    @Post('/')
    async createBookmark(
        @AuthUser() userId: number,
        @Body(new ValidationPipe()) createBookmarkDto: CreateBookmarkDto
    ) {
        const createBookmarkResponse = new CreateBookmarkResponseDto();
        try {
            const bookmark = this.bookmarkFactoryService.createNewBookmark(createBookmarkDto);
            const createdBookmark = await this.bookmarkUseCases.createBookmark(userId, bookmark);
            let createdTags: Array<Tag> = [];
            if (Array.isArray(createBookmarkDto.tagNames)) {
                const tags = await this.tagUseCases.getTagsByNames(createBookmarkDto.tagNames)
                createdTags = tags;
                await this.tagUseCases.attachTag(createdBookmark.id, tags)
            }
            const addTags = { ...createdBookmark, tags: createdTags || [] };
            
            createBookmarkResponse.success = true;
            createBookmarkResponse.createdBookmark = addTags;
            return createBookmarkResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    };

    @ApiOperation({ summary: '첫 로그인시 로컬과 DB를 동기화하는 API', description: '첫 로그인시 북마크를 동기화한다.' })
    @ApiCreatedResponse({ description: '동기화된 북마크 배열을 반환한다.', type: SyncBookmarkResponseDto })
    @ApiBody({type:SyncBookmarkDto})
    @Post('/sync')
    async syncBookmark(
        @AuthUser() userId: number,
        @Body(new ValidationPipe()) loginsyncBookmarkDto: SyncBookmarkDto
    ) {
        const syncBookmarkResponse = new SyncBookmarkResponseDto();
        try {
            const tagNames = loginsyncBookmarkDto.tagNames;
           
            const dbTags = await this.tagUseCases.getTagsByNames(tagNames)
            
            const setSyncBookmarkForm = (userId:number, bookmarks:Bookmark[], tags:Tag[]): Bookmark[] => {
                const result = bookmarks.map((bookmark) => {
                    const localTags = bookmark.tags;
                    const changedTags = localTags.map((localtag)=>{
                        const targetTag = tags.find((dbTag)=>{
                            return dbTag.tag === localtag.tag;
                        });
                        return targetTag;
                    })
                    Reflect.deleteProperty(bookmark, 'id');
                    return {...bookmark, tags:changedTags, userId:userId};
                });
                return result as any
            };

            const syncedBookmarks = setSyncBookmarkForm(userId, loginsyncBookmarkDto.bookmarks, dbTags)
            
            await this.bookmarkUseCases.syncBookmark(syncedBookmarks)
            
            syncBookmarkResponse.success = true;
            syncBookmarkResponse.message = 'synced';
            syncBookmarkResponse.bookmarks = syncedBookmarks;
            return syncBookmarkResponse;
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
            const bookmarks:any = await this.bookmarkUseCases.getUserAllBookmarks(
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
    @ApiBody({type:EditBookmarkDto})
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

            if (deleteTag) {
                await this.tagUseCases.detachTag(bookmarkId, deleteTag)
            };

            if (addTag) {
                const tags = await this.tagUseCases.getTagsByNames(addTag)
                await this.tagUseCases.attachTag(bookmarkId, tags)
            };

            if (changeUrl) {
                await this.bookmarkUseCases.editBookmarkUrl(userId, bookmarkId, editBookmarkDto.changeUrl)
            };

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
            await this.bookmarkUseCases.deleteBookmark(userId, bookmarkId);

            deleteBookmarkResponse.success = true;
            deleteBookmarkResponse.message = 'Deleted'
            return deleteBookmarkResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
