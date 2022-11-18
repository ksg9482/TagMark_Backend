import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, ValidationPipe } from '@nestjs/common';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { TagsService } from 'src/tags/tags.service';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkInputDto } from './dtos/create-bookmark.dto';
import { DeleteBookmarkInputDto } from './dtos/deleteBookmark.dto';
import { EditBookmarkUrlInputDto } from './dtos/edit-bookmarkUrl.dto';

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
        //@AuthUser() userId:number,
        @Body(new ValidationPipe()) createBookmarkInputDto: CreateBookmarkInputDto
    ) {
        const userId = 1
        
        try {
            const tagNames = this.tagsService.tagToString(createBookmarkInputDto.tags)
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
    async editBookmarkUrl(
        //@AuthUser() userId:number,
        @Param('id', ParseIntPipe) bookmarkId: number,
        @Body(new ValidationPipe()) editBookmarkUrlInputDto: EditBookmarkUrlInputDto
    ) {
        try {
            const userId = 1
            const result = await this.bookmarksService.editBookmark(userId, bookmarkId, editBookmarkUrlInputDto)
            return result
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
