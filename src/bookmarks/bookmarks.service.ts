import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CreateBookmarkInputDto, CreateBookmarkOutputDto } from './dtos/create-bookmark.dto';
import { DeleteBookmarkInputDto } from './dtos/deleteBookmark.dto';
import { EditBookmarkUrlInputDto, EditBookmarkUrlOutputDto } from './dtos/edit-bookmarkUrl.dto';
import { Bookmark } from './entities/bookmark.entity';
import { Url } from './entities/url.entity';

@Injectable()
export class BookmarksService {
    constructor(
        @InjectRepository(Bookmark)
        private readonly bookmarks: Repository<Bookmark>,
        @InjectRepository(Url)
        private readonly urls: Repository<Url>,
    ) { }

    async getAllBookmarks() {
        return await this.bookmarks.find({relations:['url', 'tags']})
    }

    async getAllUserBookmarks(userId:number) {
        return await this.bookmarks.find({where:{userId:userId},relations:['url', 'tags']})
    }

    async createBookmark(userId:number ,createBookmarkInputDto: Partial<CreateBookmarkInputDto>): Promise<CreateBookmarkOutputDto> {
        // const usercheck = await this.findByEmail(signUpInputDto.email);
        // if (usercheck) {
        //     throw new Error('Email is aleady exist');
        // };
        // const testUrl = await this.urls.findOne({where:{url:createBookmarkInputDto.url}})
        // console.log(testUrl)
        // const test = await this.bookmarks.findOne({where:{userId:userId, urlId:testUrl.id},relations:['url', 'tags']})
        // console.log(test)
        // const test2 = await this.bookmarks.createQueryBuilder('bookmark').leftJoinAndSelect('bookmark.url', 'url').leftJoinAndSelect('bookmark.tags', 'tag').where('bookmark.id = :id', {id:2}).getOne()
        // console.log(test2)
        let url = await this.urls.findOne({where:{url:createBookmarkInputDto.url}})
        // if(url) {
        //     throw new Error('Bookmark is aleady exist');
        // }
        if(!url) {
            url = await this.urls.save(this.urls.create({url:createBookmarkInputDto.url}))
        }
        console.log(url)
        const createdBookmark = await this.bookmarks.save(
            this.bookmarks.create({
                url:url,
                userId:userId,
                tags:createBookmarkInputDto.tags
            })
        );
        console.log(createdBookmark)
        
        return { bookmark: createdBookmark }
    }

    //첫 로그인 연동시. DB동기화, 이미 있는거 없는 거 구분.
    async createBookmarkBulk(userId:number ,createBookmarkInputDto: Partial<CreateBookmarkInputDto>): Promise<CreateBookmarkOutputDto> {
        // const usercheck = await this.findByEmail(signUpInputDto.email);
        // if (usercheck) {
        //     throw new Error('Email is aleady exist');
        // };
        // const testUrl = await this.urls.findOne({where:{url:createBookmarkInputDto.url}})
        
        // const test = await this.bookmarks.findOne({where:{userId:userId, urlId:testUrl.id},relations:['url', 'tags']})
        
        // const test2 = await this.bookmarks.createQueryBuilder('bookmark').leftJoinAndSelect('bookmark.url', 'url').leftJoinAndSelect('bookmark.tags', 'tag').where('bookmark.id = :id', {id:2}).getOne()
        
        let url = await this.urls.findOne({where:{url:createBookmarkInputDto.url}})
        // if(url) {
        //     throw new Error('Bookmark is aleady exist');
        // }
        if(!url) {
            url = await this.urls.save(this.urls.create({url:createBookmarkInputDto.url}))
        }
        
        const createdBookmark = await this.bookmarks.save(
            this.bookmarks.create({
                url:url,
                tags:createBookmarkInputDto.tags
            })
        );
        
        return { bookmark: createdBookmark }
    }

    async editBookmarkUrl(userId: number, editBookmarkUrlInputDto:EditBookmarkUrlInputDto): Promise<EditBookmarkUrlOutputDto> {
        const bookmark = await this.bookmarks.findOne({where:{userId:userId, id: editBookmarkUrlInputDto.bookmarkId},relations:['url'], select:['id','urlId','url']});
        return await this.urls.save({...bookmark.url, url:editBookmarkUrlInputDto.changeUrl})
    }

    async deleteBookmark(userId: number, deleteBookmarkInputDto: DeleteBookmarkInputDto) {
        // const bookmark = await this.bookmarks.findOne({where:{userId:userId, id: deleteBookmarkInputDto.bookmarkId}});
        // if(!bookmark) {
        //     throw new Error('Bookmark not found');
        // };
        // const deleteBookmark = await this.bookmarks.delete({id:deleteBookmarkInputDto.bookmarkId})
        // console.log(deleteBookmark)
        const url = await this.urls.delete({id:1})
        console.log(url)
        return {message: 'Deleted'}
    }

    async DeleteUrl(urlId:number) {
        const url = await this.urls.delete(urlId)
    }
}
