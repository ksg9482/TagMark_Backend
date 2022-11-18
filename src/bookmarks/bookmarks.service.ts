import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CreateBookmarkInputDto, CreateBookmarkOutputDto } from './dtos/create-bookmark.dto';
import { DeleteBookmarkInputDto } from './dtos/deleteBookmark.dto';
import { EditBookmarkUrlInputDto, EditBookmarkUrlOutputDto } from './dtos/edit-bookmarkUrl.dto';
import { Bookmark } from './entities/bookmark.entity';

@Injectable()
export class BookmarksService {
    constructor(
        @InjectRepository(Bookmark)
        private readonly bookmarks: Repository<Bookmark>
    ) { }

    async getAllBookmarks() {
        return await this.bookmarks.find({relations:[ 'tags']})
    }

    async getUserAllBookmarks(userId:number) {
        const bookmarks = await this.bookmarks.find({where:{userId:userId},relations:['tags']})
        const test = await this.bookmarks.createQueryBuilder('bookmark')
        //.select('*')
        .leftJoinAndSelect('bookmarks_tags', 'bookmarks_tags','bookmarks_tags.bookmarkId = bookmark.id')
        .leftJoinAndSelect('tag', 'tag', 'tag.id = bookmarks_tags.tagId')
        .getRawMany()
        //.getMany()
        console.log(test)
        return {bookmarks: bookmarks}
    }

    async createBookmark(userId:number, createBookmarkInputDto: Partial<CreateBookmarkInputDto>): Promise<CreateBookmarkOutputDto> {
        const bookmark = await this.bookmarks.findOne({where:{url:createBookmarkInputDto.url}})
        if(bookmark) {
            throw new Error('Bookmark is aleady exist')
        }
        const createdBookmark = await this.bookmarks.save(
            this.bookmarks.create({
                url:createBookmarkInputDto.url,
                userId:userId,
                tags:createBookmarkInputDto.tags
            })
        );
        
        return { bookmark: createdBookmark }
    }

    //첫 로그인 연동시. DB동기화, 이미 있는거 없는 거 구분.
    async createBookmarkBulk(userId:number ,createBookmarkInputDto: Partial<CreateBookmarkInputDto>): Promise<CreateBookmarkOutputDto> {
        const bookmark = await this.bookmarks.findOne({where:{url:createBookmarkInputDto.url}})
        
        if(bookmark) {
            throw new Error('Bookmark is aleady exist')
        }
        const createdBookmark = await this.bookmarks.save(
            this.bookmarks.create({
                url:createBookmarkInputDto.url,
                userId:userId,
                tags:createBookmarkInputDto.tags
            })
        );
        
        return { bookmark: createdBookmark }
    }

    async editBookmark(userId: number, bookmarkId:number, editBookmarkUrlInputDto:EditBookmarkUrlInputDto){
        this.bookmarkCheck(userId, bookmarkId)
        await this.bookmarks.update(bookmarkId,{url:editBookmarkUrlInputDto.changeUrl})
        return {message: 'Updated'}
    }

    async deleteBookmark(userId: number, bookmarkId:number) {
        this.bookmarkCheck(userId, bookmarkId)
        await this.bookmarks.delete({id:bookmarkId})
        return {message: 'Deleted'}
    }

    async bookmarkCheck(userId:number, bookmarkId:number): Promise<Bookmark> {
        const bookmark = await this.bookmarks.findOne({where:{userId:userId, id:bookmarkId}});
        if(!bookmark) {
            throw new Error('Bookmark not found');
        };
        return bookmark;
    }

}
