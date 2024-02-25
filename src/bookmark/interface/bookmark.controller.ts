import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  LoggerService,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser } from 'src/auth/auth-user.decorator';
import {
  CreateBookmarkDto,
  CreateBookmarkResponseDto,
  DeleteBookmarkResponseDto,
  GetUserBookmarkCountResponseDto,
  EditBookmarkDto,
  EditBookmarkResponseDto,
  GetUserAllBookmarksDto,
  GetUserAllBookmarksResponseDto,
  SyncBookmarkDto,
  SyncBookmarkResponseDto,
} from 'src/bookmark/interface/dto';
import { BookmarkUseCase } from 'src/bookmark/application/bookmark.use-case';
import { BookmarkFactory } from 'src/bookmark/domain/bookmark.factory';
import { TagUseCase } from 'src/tag/application/tag.use-case';
import { TagFactory } from 'src/tag/domain/tag.factory';
import {
  GetSearchTagsDto,
  GetSearchTagsResponseDto,
} from 'src/bookmark/interface/dto';
import { UtilsService } from 'src/utils/utils.service';
import { AuthGuard } from 'src/auth.guard';
import { Tags } from 'src/tag/domain/tags';
import { ResponseDto } from 'src/common/dto/response.dto';
import { Bookmarks } from '../domain/bookmarks';

@UseGuards(AuthGuard)
@ApiTags('Bookmark')
@Controller('api/bookmark')
export class BookmarkController {
  constructor(
    private bookmarkUseCase: BookmarkUseCase,
    private tagUseCase: TagUseCase,
    @Inject(Logger) private readonly logger: LoggerService,
    private utilsService: UtilsService,
  ) {}

  @ApiOperation({
    summary: '북마크를 생성하는 API',
    description: '북마크를 생성한다.',
  })
  @ApiCreatedResponse({
    description: '북마크를 생성하고 결과를 반환한다.',
    type: CreateBookmarkResponseDto,
  })
  @ApiBody({ type: CreateBookmarkDto })
  @Post('/')
  async createBookmark(
    @AuthUser() userId: string,
    @Body(new ValidationPipe()) createBookmarkDto: CreateBookmarkDto,
  ) {
    try {
      const { url, tagNames } = createBookmarkDto;
      console.log(
        `createBookmark - userId: ${userId}, url: ${url}, tagNames: ${tagNames}`,
      );
      const createdBookmark = await this.bookmarkUseCase.createBookmark(
        userId,
        url,
        tagNames,
      );

      return ResponseDto.OK_WITH(
        new CreateBookmarkResponseDto(createdBookmark),
      );
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: '첫 로그인시 로컬과 DB를 동기화하는 API',
    description: '첫 로그인시 북마크를 동기화한다.',
  })
  @ApiCreatedResponse({
    description: '동기화된 북마크 배열을 반환한다.',
    type: SyncBookmarkResponseDto,
  })
  @ApiBody({ type: SyncBookmarkDto })
  @Post('/sync')
  async syncBookmark(
    @AuthUser() userId: string,
    @Body(new ValidationPipe()) loginsyncBookmarkDto: SyncBookmarkDto,
  ) {
    try {
      const tagNames = loginsyncBookmarkDto.tagNames || [];
      const bookmarks = loginsyncBookmarkDto.bookmarks || [];
      const dbTags = await this.tagUseCase.getTagsByNames(tagNames);
      const syncedBookmarks = this.bookmarkUseCase.setSyncBookmarkForm(
        userId,
        bookmarks,
        new Tags(dbTags.tags),
      );
      await this.bookmarkUseCase.syncBookmark(new Bookmarks(syncedBookmarks));

      const message = 'synced';
      return ResponseDto.OK_WITH(
        new SyncBookmarkResponseDto(message, syncedBookmarks),
      );
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: '해당 유저가 생성한 북마크를 반환하는 API',
    description: '유저가 생성한 모든 북마크를 반환한다.',
  })
  @ApiCreatedResponse({
    description: '해당 유저가 생성한 북마크를 반환한다.',
    type: GetUserAllBookmarksResponseDto,
  })
  @ApiQuery({
    name: 'pageno',
    type: 'number',
    description: '페이지네이션 넘버. 1부터 시작하고 20개 단위이다.',
  })
  @Get('/')
  async getUserAllBookmark(
    @AuthUser() userId: string,
    @Query(new ValidationPipe({ transform: true }))
    page: GetUserAllBookmarksDto,
  ) {
    try {
      const bookmarks = await this.bookmarkUseCase.getUserAllBookmarks(
        userId,
        page,
      );

      return ResponseDto.OK_WITH(
        new GetUserAllBookmarksResponseDto(
          bookmarks.totalPage,
          bookmarks.totalCount,
          bookmarks.bookmarks,
        ),
      );
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: '유저가 생성한 북마크의 갯수를 반환하는 API',
    description: '북마크를 갯수를 반환한다.',
  })
  @ApiCreatedResponse({
    description: '유저가 생성한 북마크의 갯수를 반환한다.',
    type: GetUserBookmarkCountResponseDto,
  })
  @Get('/count')
  async getUserBookmarkCount(@AuthUser() userId: string) {
    try {
      const count = await this.bookmarkUseCase.getUserBookmarkCount(userId);

      return ResponseDto.OK_WITH(
        new GetUserBookmarkCountResponseDto(Number(count)),
      );
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: '북마크의 데이터를 수정하는 API',
    description: '북마크의 데이터를 수정한다.',
  })
  @ApiCreatedResponse({
    description: '북마크를 수정하고 Updated 메시지를 반환한다.',
    type: EditBookmarkResponseDto,
  })
  @ApiParam({ name: 'id', description: '변경할 북마크 id' })
  @ApiBody({ type: EditBookmarkDto })
  @Patch('/:id')
  async editBookmark(
    @AuthUser() userId: string,
    @Param('id') bookmarkId: string,
    @Body(new ValidationPipe()) editBookmarkDto: EditBookmarkDto,
  ) {
    if (editBookmarkDto.url && editBookmarkDto.url.length <= 0) {
      const errorMessage = 'Bookmark URL should not be empty';
      return new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
    try {
      const url = editBookmarkDto.url;
      const deleteTag =
        editBookmarkDto.deleteTag?.length > 0
          ? editBookmarkDto.deleteTag
          : null;
      const addTag =
        editBookmarkDto.addTag?.length > 0 ? editBookmarkDto.addTag : null;

      if (deleteTag) {
        await this.tagUseCase.detachTag(bookmarkId, deleteTag);
      }

      if (addTag) {
        const tags = await this.tagUseCase.getTagsByNames(addTag);
        await this.tagUseCase.attachTag(bookmarkId, tags);
      }

      if (url) {
        await this.bookmarkUseCase.editBookmarkUrl(userId, bookmarkId, url);
      }

      const message = 'Updated';
      return ResponseDto.OK_WITH(new EditBookmarkResponseDto(message));
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: '여러 태그를 AND 검색하는 API',
    description: '입력한 모든 태그를 만족하는 북마크를 반환한다.',
  })
  @ApiCreatedResponse({
    description: '모든 태그를 만족하는 북마크를 반환한다.',
    type: GetSearchTagsResponseDto,
  })
  @ApiQuery({
    name: 'tags',
    type: 'string',
    description: '검색할 태그 문자열. ","로 split한다.',
  })
  @ApiQuery({
    name: 'pageno',
    type: 'number',
    description: '페이지네이션 넘버. 1부터 시작하고 20개 단위이다.',
  })
  @Get('/search-and')
  async andFindTagAndBookmarks(
    @AuthUser() userId: string,
    @Query('tags') tags: string,
    @Query(new ValidationPipe({ transform: true })) page: GetSearchTagsDto,
  ) {
    try {
      const tagArr = tags.split(',');

      const bookmarks = await this.bookmarkUseCase.getTagAllBookmarksAND(
        userId,
        tagArr,
        page,
      );

      return ResponseDto.OK_WITH(
        new GetSearchTagsResponseDto(
          bookmarks.totalPage,
          bookmarks.totalCount,
          bookmarks.bookmarks,
        ),
      );
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: '여러 태그를 OR 검색하는 API',
    description: '입력한 일부 태그를 만족하는 북마크를 반환한다.',
  })
  @ApiCreatedResponse({
    description: '일부 태그를 만족하는 북마크를 반환한다.',
    type: GetSearchTagsResponseDto,
  })
  @ApiQuery({
    name: 'tags',
    type: 'string',
    description: '검색할 태그 문자열. ","로 split한다.',
  })
  @ApiQuery({
    name: 'pageno',
    type: 'number',
    description: '페이지네이션 넘버. 1부터 시작하고 20개 단위이다.',
  })
  @Get('/search-or')
  async orFindTagAndBookmarks(
    @AuthUser() userId: string,
    @Query('tags') tags: string,
    @Query(new ValidationPipe({ transform: true })) page: GetSearchTagsDto,
  ) {
    try {
      const tagArr = tags.split(',');

      const bookmarks = await this.bookmarkUseCase.getTagAllBookmarksOR(
        userId,
        tagArr,
        page,
      );

      return ResponseDto.OK_WITH(
        new GetSearchTagsResponseDto(
          bookmarks.totalPage,
          bookmarks.totalCount,
          bookmarks.bookmarks,
        ),
      );
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: '북마크를 제거하는 API',
    description: '북마크를 제거한다.',
  })
  @ApiCreatedResponse({
    description: '북마크를 제거하고 Deleted 메시지를 반환한다.',
    type: DeleteBookmarkResponseDto,
  })
  @ApiParam({ name: 'id', description: '삭제할 북마크 id' })
  @Delete('/:id')
  async deleteBookmark(
    @AuthUser() userId: string,
    @Param('id') bookmarkId: string,
  ) {
    try {
      await this.bookmarkUseCase.deleteBookmark(userId, bookmarkId);

      const message = 'Deleted';
      return ResponseDto.OK_WITH(new DeleteBookmarkResponseDto(message));
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
