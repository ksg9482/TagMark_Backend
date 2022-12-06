import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, ValidationPipe } from "@nestjs/common";
import { AuthUser } from "src/auth/auth-user.decorator";
import { CreateBookmarkDto, CreateBookmarkResponseDto, EditBookmarkDto, EditBookmarkResponseDto, GetUserAllBookmarksResponseDto } from "src/core/dtos";
import { DeleteBookmarkResponseDto } from "src/core/dtos/bookmark/delete-bookmark.dto";
import { GetUserBookmarkCountResponseDto } from "src/core/dtos/bookmark/get-user-bookmark-count.dto";
import { BookmarkUseCases, BookmarkFactoryService } from "src/use-cases/bookmark";
import { TagUseCases } from "src/use-cases/tag";

@Controller('api/bookmark')
export class BookmarkController {
    constructor(
        private bookmarkUseCases:BookmarkUseCases,
        private bookmarkFactoryService:BookmarkFactoryService,
        private tagUseCases:TagUseCases
    ) {}

    // @Post('/')
    // async createBookmark(
    //     @Body() createBookmarkDto: CreateBookmarkDto
    // ): Promise<any> {
    //     const createBookmarkResponse = new CreateBookmarkResponseDto();
    //     try {
    //         const user = this.bookmarkFactoryService.createNewBookmark(createBookmarkDto);
    //         const createdBookmark = await this.bookmarkUseCases.createBookmark(user);

    //         createBookmarkResponse.success = true;
    //         createBookmarkResponse.createdBookmark = createdBookmark;

    //     } catch (error) {
    //         createBookmarkResponse.success = false;
    //     }

    //     return createBookmarkResponse;
    // }
    //페이지네이션 적용한 것도 만들어야 함
    @Post('/')
    async createBookmark(
        //@AuthUser() userId:number,
        @Body(new ValidationPipe()) createBookmarkDto: CreateBookmarkDto//CreateBookmarkDto
    ) {
        const createBookmarkResponse = new CreateBookmarkResponseDto();
        const userId = 1
        try {
            const bookmark = this.bookmarkFactoryService.createNewBookmark(createBookmarkDto);
            const createdBookmark = await this.bookmarkUseCases.createBookmark(userId, bookmark);
            let createdTags:Array<any>;
            //이거 만들어야됨
            if(createBookmarkDto.tags.length >= 0){
                const tags = await this.tagUseCases.getTagsByNames(createBookmarkDto.tags)
                createdTags = tags;
                await this.tagUseCases.attachTag(userId, createdBookmark.id, tags)
            }
            const addTags = {...createdBookmark, tags:createdTags || []}
            createBookmarkResponse.success = true;
            createBookmarkResponse.createdBookmark = addTags;
        } catch (error) {
            createBookmarkResponse.success = false;
            console.log(error)
        }
        return createBookmarkResponse;
    }

    @Get('/')
    async getUserAllBookmark(
        @AuthUser() userId:number,
    ) {
        const getUserAllBookmarkResponse = new GetUserAllBookmarksResponseDto()
        try {
            //const userId = 1
            const bookmarks = await this.bookmarkUseCases.getUserAllBookmarks(userId);
            getUserAllBookmarkResponse.success = true;
            getUserAllBookmarkResponse.bookmarks = bookmarks;
        } catch (error) {
            getUserAllBookmarkResponse.success = false;
            console.log(error)
        }
        return getUserAllBookmarkResponse;
    }

    //유저정보, 북마크 카운트, 태그 카운트 분리.
    //특히 태그는 태그 분석결과 넘겨줘야 함
    @Get('/count')
    async getUserBookmarkCount(
        @AuthUser() userId:number,
    ) {
        const getUserAllBookmarkResponse = new GetUserBookmarkCountResponseDto()
        try {
            //const userId = 1
            const count = await this.bookmarkUseCases.getUserBookmarkCount(userId);
            getUserAllBookmarkResponse.success = true;
            getUserAllBookmarkResponse.count = Number(count);
        } catch (error) {
            getUserAllBookmarkResponse.success = false;
            console.log(error)
        }
        return getUserAllBookmarkResponse;
    }


    

    @Patch('/:id')
    async editBookmark(
        @AuthUser() userId:number,
        @Param('id', ParseIntPipe) bookmarkId: number,
        @Body(new ValidationPipe()) editBookmarkDto: EditBookmarkDto
    ) {
        //const userId = 1
        const editBookmarkResponse = new EditBookmarkResponseDto()
        try {
            console.log('bookmark edit -', bookmarkId, editBookmarkDto)
            const changeUrl = editBookmarkDto.changeUrl;
            const deleteTag = editBookmarkDto.deleteTag?.length > 0 ? editBookmarkDto.deleteTag : null;
            const addTag = editBookmarkDto.addTag?.length > 0 ? editBookmarkDto.addTag : null;
            
            if(deleteTag || addTag) {
                if(deleteTag) {
                    const {message, deleteCount} = await this.tagUseCases.detachTag(userId,bookmarkId,deleteTag)
                }
                if(addTag) {
                    const tags = await this.tagUseCases.getTagsByNames(addTag)
                    const result = await this.tagUseCases.attachTag(userId,bookmarkId, tags)
                    //console.log(result)
                }
            }
            if(changeUrl) {
                await this.bookmarkUseCases.editBookmarkUrl(userId, bookmarkId, editBookmarkDto.changeUrl)
            }
            editBookmarkResponse.success = true;
            editBookmarkResponse.message = 'Updated';
        } catch (error) {
            editBookmarkResponse.success = false;
            console.log(error)
        }
        return editBookmarkResponse;
    }

    @Delete('/:id')
    async deleteBookmark(
        @AuthUser() userId:number,
        @Param('id', ParseIntPipe) bookmarkId: number
    ) {
        const deleteBookmarkResponse = new DeleteBookmarkResponseDto()
        try {
            //const userId = 1
            const result = await this.bookmarkUseCases.deleteBookmark(userId, bookmarkId)
            deleteBookmarkResponse.success = true;
            deleteBookmarkResponse.message = 'Deleted'
        } catch (error) {
            deleteBookmarkResponse.success = false;
            console.log(error)
        }
        return deleteBookmarkResponse;
    }
}