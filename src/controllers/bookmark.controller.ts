import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Logger, LoggerService, Param, ParseIntPipe, Patch, Post, Query, ValidationPipe } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
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

    //일단 작성은 0개를 잡자. 다음 업그레이드에선 로컬과 db 차이점이 생기면 감지해서 반영하게.
    //북마크 리스트를 통째로 보내면 여기서 처리하는게 나을까? 아니면 클라이언트에서 통째로 넣으면 북마크, 태그 분리하는 폼으로 보내게 해야할까? 
    //로그인 때 일단 bookmark 카운트 받음. 0개면 이어서 api에 요청.
    @Post('/sync')
    async syncBookmark(
        @AuthUser() userId: number,
        @Body(new ValidationPipe()) loginsyncBookmarkDto: SyncBookmarkDto
    ) {
        const syncBookmarkResponse = new SyncBookmarkResponseDto();
        try {
            //const bulkcreatedBookmark = await this.bookmarkUseCases.createBookmark(userId, bookmark);
            //북마크 배열, 태그이름 배열
            //태그배열 부터 테이블에 넣기. 북마크랑 연결해야 되는데 그럴려면 태그id로 넣는게 좋다고 본다.
            //만들든 가져오든 태그아이디, 태그이름 배열이 생성된다.
            //북마크 태그들을 map -> DB 태그 배열로 갱신한다. 쿼리를 이름으로 하는거보다 id로 하는게 더 빠르다.
            //아니면 클라이언트에서 태그 이름 보냄->아이디, 이름 배열 응답. 그걸로 갱신하고 북마크 싱크 요청이 나으려나?
            //관건은 결국 총합시간이 얼마나 걸리느냐. 느린 http통신 여러번보단 줄이는게 더 빠를것 같다. 그러나 서버자원 문제가 있다.
            const tagNames = loginsyncBookmarkDto.tagNames;
           
            const dbTags = await this.tagUseCases.getTagsByNames(tagNames)
            //여기 유즈케이스로 보내야됨. 일단 북마크 배열 생성까지는 완료. 벌크 저장 로직필요
            const syncedBookmarks:Bookmark[] = loginsyncBookmarkDto.bookmarks.map((bookmark) => {
                const changedUrl = this.utilServices.secure().wrapper().decryptWrapper(bookmark.url)
                const localTags = bookmark.tags;
                const changedTags = localTags.map((localtag)=>{
                    const targetTag = dbTags.find((dbTag)=>{
                        return dbTag.tag === localtag.tag
                    })
                    
                    return targetTag
                })
                Reflect.deleteProperty(bookmark, 'id')
                return {...bookmark, url:changedUrl, tags:changedTags, userId:userId}
            })
            const createdBookmarks = await this.bookmarkUseCases.syncBookmark(userId, syncedBookmarks)
            console.log(createdBookmarks)
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