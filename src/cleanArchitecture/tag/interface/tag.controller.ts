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
  ParseIntPipe,
  Post,
  Query,
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
  CreateTagDto,
  CreateTagResponseDto,
  DeleteTagResponseDto,
  GetUserAllTagsResponseDto,
} from 'src/cleanArchitecture/tag/interface/dto';
import { TagUseCases } from 'src/cleanArchitecture/tag/application/tag.use-case';

@ApiTags('Tag')
@Controller('api/tag')
export class TagController {
  constructor(
    private tagUseCases: TagUseCases,
    @Inject(Logger) private readonly logger: LoggerService,
  ) {}

  @ApiOperation({
    summary: '태그를 생성하는 API',
    description: '태그를 생성한다.',
  })
  @ApiCreatedResponse({
    description: '태그를 생성하고 결과를 반환한다.',
    type: CreateTagResponseDto,
  })
  @ApiBody({ type: CreateTagDto })
  @Post('/')
  async createTag(@Body(new ValidationPipe()) createTagDto: CreateTagDto) {
    const createTagResponse = new CreateTagResponseDto();
    const { tag } = createTagDto;
    try {
      const createdTag = await this.tagUseCases.createTag(tag);
      createTagResponse.success = true;
      createTagResponse.createdTag = createdTag;
      return createTagResponse;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: '유저가 생성한 모든 태그를 반환하는 API',
    description: '유저가 생성한 모든 태그를 반환한다.',
  })
  @ApiCreatedResponse({
    description: '유저가 생성한 모든 태그를 반환한다.',
    type: GetUserAllTagsResponseDto,
  })
  @Get('/')
  async getUserAllTags(@AuthUser() userId: string) {
    const getUserAllTagsResponse = new GetUserAllTagsResponseDto();
    try {
      const tags = await this.tagUseCases.getUserAllTags(userId);

      getUserAllTagsResponse.success = true;
      getUserAllTagsResponse.tags = tags;
      return getUserAllTagsResponse;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: '유저가 생성한 태그의 갯수를 반환하는 API',
    description: '모든 태그의 갯수를 반환한다.',
  })
  @ApiCreatedResponse({
    description: '유저가 생성한 모든 태그의 갯수를 반환한다.',
    type: GetUserAllTagsResponseDto,
  })
  @Get('/count')
  async getUserTagCount(@AuthUser() userId: string) {
    const getUserAllTagsResponse = new GetUserAllTagsResponseDto();
    try {
      const tags = await this.tagUseCases.getUserAllTags(userId);

      getUserAllTagsResponse.success = true;
      getUserAllTagsResponse.tags = tags;
      return getUserAllTagsResponse;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @ApiOperation({
  //   summary: '여러 태그를 AND 검색하는 API',
  //   description: '입력한 모든 태그를 만족하는 북마크를 반환한다.',
  // })
  // @ApiCreatedResponse({
  //   description: '모든 태그를 만족하는 북마크를 반환한다.',
  //   type: GetSearchTagsResponseDto,
  // })
  // @ApiQuery({
  //   name: 'tags',
  //   type: 'string',
  //   description: '검색할 태그 문자열. ","로 split한다.',
  // })
  // @ApiQuery({
  //   name: 'pageno',
  //   type: 'number',
  //   description: '페이지네이션 넘버. 1부터 시작하고 20개 단위이다.',
  // })
  // @Get('/search-and')
  // async andFindTagAndBookmarks(
  //   @AuthUser() userId: string,
  //   @Query('tags') tags: string,
  //   @Query(new ValidationPipe({ transform: true })) page: GetSearchTagsDto,
  // ) {
  //   const getSearchTagsResponseDto = new GetSearchTagsResponseDto();
  //   try {
  //     const tagArr = tags.split(',');

  //     const bookmarks = await this.tagUseCases.getTagAllBookmarksAND(
  //       userId,
  //       tagArr,
  //       page,
  //     );

  //     getSearchTagsResponseDto.success = true;
  //     getSearchTagsResponseDto.totalCount = bookmarks.totalCount;
  //     getSearchTagsResponseDto.totalPage = bookmarks.totalPage;
  //     getSearchTagsResponseDto.bookmarks = bookmarks.bookmarks;
  //     return getSearchTagsResponseDto;
  //   } catch (error) {
  //     this.logger.error(error);
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // @ApiOperation({
  //   summary: '여러 태그를 OR 검색하는 API',
  //   description: '입력한 일부 태그를 만족하는 북마크를 반환한다.',
  // })
  // @ApiCreatedResponse({
  //   description: '일부 태그를 만족하는 북마크를 반환한다.',
  //   type: GetSearchTagsResponseDto,
  // })
  // @ApiQuery({
  //   name: 'tags',
  //   type: 'string',
  //   description: '검색할 태그 문자열. ","로 split한다.',
  // })
  // @ApiQuery({
  //   name: 'pageno',
  //   type: 'number',
  //   description: '페이지네이션 넘버. 1부터 시작하고 20개 단위이다.',
  // })
  // @Get('/search-or')
  // async orFindTagAndBookmarks(
  //   @AuthUser() userId: string,
  //   @Query('tags') tags: string,
  //   @Query(new ValidationPipe({ transform: true })) page: GetSearchTagsDto,
  // ) {
  //   const getSearchTagsResponseDto = new GetSearchTagsResponseDto();
  //   try {
  //     const tagArr = tags.split(',');

  //     const bookmarks: any = await this.tagUseCases.getTagAllBookmarksOR(
  //       userId,
  //       tagArr,
  //       page,
  //     );

  //     getSearchTagsResponseDto.success = true;
  //     getSearchTagsResponseDto.totalCount = bookmarks.totalCount;
  //     getSearchTagsResponseDto.totalPage = bookmarks.totalPage;
  //     getSearchTagsResponseDto.bookmarks = bookmarks.bookmarks;
  //     return getSearchTagsResponseDto;
  //   } catch (error) {
  //     this.logger.error(error);
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  @ApiOperation({
    summary: '북마크에 등록된 태그를 삭제하는 API',
    description: '북마크에 등록된 태그를 삭제한다.',
  })
  @ApiCreatedResponse({
    description: '북마크에 등록된 태그를 삭제하고 Deleted 메시지를 반환한다.',
    type: DeleteTagResponseDto,
  })
  @ApiParam({
    name: 'bookmark_id',
    type: 'number',
    description: '삭제할 태그가 있는 북마크 id',
  })
  @ApiQuery({ name: 'tag_ids', type: 'Array<number>' })
  @Delete('/:bookmark_id')
  async detachTag(
    @Param('bookmark_id', ParseIntPipe) bookmarkId: string,
    @Query('tag_ids') tagIds: string,
  ) {
    const deleteTagResponse = new DeleteTagResponseDto();
    try {
      const parseTagIds = tagIds.split(',').map((tagIds) => {
        return tagIds;
      });
      await this.tagUseCases.detachTag(bookmarkId, parseTagIds);

      deleteTagResponse.success = true;
      deleteTagResponse.message = 'Deleted';
      return deleteTagResponse;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
