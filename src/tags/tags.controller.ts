import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, ValidationPipe } from '@nestjs/common';
import { CreateTagInputDto } from './dtos/create-tag.dto';
import { EditTagInputDto } from './dtos/edit-tag.dto copy';
import { GetTagsInputDto } from './dtos/get-tags.dto';
import { TagsService } from './tags.service';
interface AttachTagDto {
    tagId: number[]
}
@Controller('tags')
export class TagsController {
    constructor(
        private readonly tagsService: TagsService
    ) { };
    //DB에 저장된 모든 태그
    @Get('/all')
    async getAllTag() {
        try {
            const {tags} = await this.tagsService.getAllTags();
            return tags;
        } catch (error) {
            console.log(error)
        }
    }
    //유저가 가진 모든 태그 + 페이지네이션
    @Get('/')
    async getUserAllTags(
        //@AuthUser() userId:number,
    ) {
        try {
            const userId = 1
            const {tags} = await this.tagsService.getAlluserTags(userId);
            return tags;
        } catch (error) {
            console.log(error)
        }
    }
    //검색용. 배열이용. AND검색. 태그에 해당하는 모든 북마크. 태그랑 북마크랑 책임 나눠야함
    async andFindTagAndBookmarks() {
        
    }
    //검색용. 배열이용. OR검색. 태그에 해당하는 모든 북마크. 태그랑 북마크랑 책임 나눠야함
    async orFindTagAndBookmarks() {
        
    }
    
    @Post('/')
    async createTag(
        //@AuthUser() userId:number,
        @Body(new ValidationPipe()) createTagInputDto: CreateTagInputDto
    ) {
        try {
            const userId = 1
            const { tag } = await this.tagsService.createTag(userId, createTagInputDto)
            return tag
        } catch (error) {
            console.log(error)
        }
    }

    @Patch('/:id')
    async editTag(
        //@AuthUser() userId:number,
        @Param('id', ParseIntPipe) tagId: number,
        @Body(new ValidationPipe()) editTagInputDto: EditTagInputDto
    ) {
        try {
            const userId = 1
            const { tag } = await this.tagsService.editTag(userId, tagId, editTagInputDto)
            return tag
        } catch (error) {
            console.log(error)
        }
    }

    @Post('/test')
    async attachTag(
        @Body() getTagsInputDto: GetTagsInputDto
    ) {
        const tags = await this.tagsService.getTagsByNames(['여행', '야시장']);
        return tags
    }
}
