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
  CreateTagDto,
  CreateTagResponseDto,
  DeleteTagResponseDto,
  GetUserAllTagsResponseDto,
} from 'src/tag/interface/dto';
import { TagUseCase } from 'src/tag/application/tag.use-case';
import { AuthGuard } from 'src/auth.guard';
import { ResponseDto } from 'src/common/dto/response.dto';

@UseGuards(AuthGuard)
@ApiTags('Tag')
@Controller('api/tag')
export class TagController {
  constructor(
    private tagUseCase: TagUseCase,
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
    const { tag } = createTagDto;
    try {
      const createdTag = await this.tagUseCase.createTag({ tag: tag });

      return ResponseDto.OK_WITH(new CreateTagResponseDto(createdTag));
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
    try {
      const tagWithCounts = await this.tagUseCase.getUserAllTags(userId);

      return ResponseDto.OK_WITH(new GetUserAllTagsResponseDto(tagWithCounts));
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
    try {
      const tagWithCounts = await this.tagUseCase.getUserAllTags(userId);
      return ResponseDto.OK_WITH(new GetUserAllTagsResponseDto(tagWithCounts));
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

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
    @Param('bookmark_id') bookmarkId: string,
    @Query('tag_ids') tagIds: string,
  ) {
    try {
      const parseTagIds = tagIds.split(',').map((tagIds) => {
        return tagIds;
      });
      await this.tagUseCase.detachTag(bookmarkId, parseTagIds);

      const message = 'Deleted';
      return ResponseDto.OK_WITH(new DeleteTagResponseDto(message));
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
