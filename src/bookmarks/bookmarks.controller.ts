import { Body, Controller, Delete, Patch, Post, ValidationPipe } from '@nestjs/common';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkInputDto } from './dtos/create-bookmark.dto';
import { DeleteBookmarkInputDto } from './dtos/deleteBookmark.dto';
import { EditBookmarkUrlInputDto } from './dtos/edit-bookmarkUrl.dto';

@Controller('bookmarks')
export class BookmarksController {
    constructor(
        private readonly bookmarksService: BookmarksService
        ) { };

    @Post('/')
    async createBookmark(
        //@AuthUser() userId:number,
        @Body(new ValidationPipe()) createBookmarkInputDto: CreateBookmarkInputDto
    ) {
        try {
            const userId = 1
            const { bookmark } = await this.bookmarksService.createBookmark(userId, createBookmarkInputDto)
            return bookmark
        } catch (error) {
            console.log(error)
        }
    }

    @Patch('/')
    async editBookmarkUrl(
        //@AuthUser() userId:number,
        @Body(new ValidationPipe()) editBookmarkUrlInputDto: EditBookmarkUrlInputDto
    ) {
        try {
            const userId = 1
            const result = await this.bookmarksService.editBookmarkUrl(userId, editBookmarkUrlInputDto)
            return result
        } catch (error) {
            console.log(error)
        }
    }

    @Delete('/')
    async deleteBookmark(
        //@AuthUser() userId:number,
        @Body(new ValidationPipe()) deleteBookmarkInputDto: DeleteBookmarkInputDto
    ) {
        try {
            const userId = 1
            const result = await this.bookmarksService.deleteBookmark(userId, deleteBookmarkInputDto)
            return result
        } catch (error) {
            console.log(error)
        }
    }
}
