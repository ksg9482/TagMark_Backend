import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, ValidationPipe } from '@nestjs/common';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { TagsService } from 'src/tags/tags.service';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkInputDto } from './dtos/create-bookmark.dto';
import { DeleteBookmarkInputDto } from './dtos/deleteBookmark.dto';
import { EditBookmarkInputDto } from './dtos/edit-bookmark.dto';

@Controller('bookmarks')
export class BookmarksController {
    constructor(
        private readonly bookmarksService: BookmarksService,
        private readonly tagsService: TagsService
        ) { };

    @Get('/mybookmark')
    async getUserAllBookmark(
        //@AuthUser() userId:number,
    ) {
        try {
            const userId = 1
            const { bookmarks } = await this.bookmarksService.getUserAllBookmarks(userId)
            return bookmarks
        } catch (error) {
            console.log(error)
        }
    }

    @Post('/')
    async createBookmark(
        @AuthUser() userId:number,
        @Body(new ValidationPipe()) createBookmarkInputDto: CreateBookmarkInputDto
    ) {
        //console.log(userId,createBookmarkInputDto)
        try {
            const tagNames = createBookmarkInputDto.tags as unknown as string[]
            const tags = await this.tagsService.getTagsByNames(tagNames)
            createBookmarkInputDto.tags = tags;

            const { bookmark } = await this.bookmarksService.createBookmark(userId, createBookmarkInputDto)
            await this.tagsService.attachTag(userId, bookmark.id, tags)
            return bookmark
        } catch (error) {
            console.log(error)
        }
    }

    @Patch('/:id')
    async editBookmark(
        //@AuthUser() userId:number,
        @Param('id', ParseIntPipe) bookmarkId: number,
        @Body(new ValidationPipe()) editBookmarkInputDto: EditBookmarkInputDto
    ) {
        const userId = 1
        try {
            
            const changeUrl = editBookmarkInputDto.changeUrl;
            const deleteTag = editBookmarkInputDto.deleteTag?.length > 0 ? editBookmarkInputDto.deleteTag : null;
            const addTag = editBookmarkInputDto.addTag?.length > 0 ? editBookmarkInputDto.addTag : null;
            
            if(deleteTag || addTag) {
                if(deleteTag) {
                    const {message, deleteCount} = await this.tagsService.deleteTag(userId,bookmarkId,deleteTag)
                }
                if(addTag) {
                    const tags = await this.tagsService.getTagsByNames(addTag)
                    const result = await this.tagsService.attachTag(userId,bookmarkId, tags)
                    //console.log(result)
                }
            }
            if(changeUrl) {
                await this.bookmarksService.editBookmarkUrl(userId, bookmarkId, editBookmarkInputDto.changeUrl)
            }
            return {message: 'Updated'}
        } catch (error) {
            console.log(error)
        }
    }

    @Delete('/:id')
    async deleteBookmark(
        //@AuthUser() userId:number,
        @Param('id', ParseIntPipe) bookmarkId: number
    ) {
        try {
            const userId = 1
            const result = await this.bookmarksService.deleteBookmark(userId, bookmarkId)
            return result
        } catch (error) {
            console.log(error)
        }
    }
}
