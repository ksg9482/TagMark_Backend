import { HttpException, Inject } from "@nestjs/common";
import { DataServices } from "src/core/abstracts";
import { CreateBookmarkDto, GetUserAllBookmarksDto } from "src/core/dtos";
import { Bookmark } from "src/core/entities";
import { Page } from "./bookmark.pagination";


export class BookmarkUseCases {
    constructor(
        @Inject(DataServices)
        private dataService: DataServices,
    ) { }

    // async createBookmark(bookmark: Bookmark):Promise<Bookmark> {
    //     try {
    //         const createdUser = await this.dataService.bookmarks.create(bookmark);
    //         return createdUser
    //     } catch (error) {
    //         throw error;
    //     }
    // }
    async createBookmark(userId: number, createBookmarkDto: CreateBookmarkDto): Promise<Bookmark> {
        const { tags, url } = createBookmarkDto;
        const bookmark = await this.dataService.bookmarks.getBookmarkByUrl(url)
        if (bookmark) {
            throw new Error('Bookmark is aleady exist')
        }
        //이거 조인테이블에 저장하도록 바꿘야됨
        const createdBookmark = await this.dataService.bookmarks.create({
            url: url,
            userId: userId,
            tags: tags
        });

        return createdBookmark;
    }

    async getAllBookmarks() {
        return await this.dataService.bookmarks.getAll()
    }

    async getUserAllBookmarks(userId: number, page: GetUserAllBookmarksDto) {
        const limit = page.getLimit()
        const offset = page.getOffset()
        const tagProperty = (/*entityName:string,properties:string[]*/) => {
            const name = 'tag'
            const test = ['id', 'tag']
            return `'id', "tag"."id",'tag', "tag"."tag"`
        }
        //유저 아이디 넣으면 이거 나오게 하는게 나을듯
        const bookmarks: Page<Bookmark> = await this.dataService.bookmarks.getUserAllBookmarks(
            userId,
            {
                take: limit,
                skip: offset
            }
        );
        const bookmarksForm = bookmarks.bookmarks.map((bookmark) => {
            if (bookmark.tags[0].id === null) {
                bookmark.tags = null
            }
            return bookmark
        })
        return {...bookmarks, bookmarks:bookmarksForm}
    }

    async getUserBookmarkCount(userId: number) {
        const { count } = await this.dataService.bookmarks.getcount(userId)
        return count
    }



    //첫 로그인 연동시. DB동기화, 이미 있는거 없는 거 구분.
    // async createBookmarkBulk(userId:number ,createBookmarkDto: Partial<CreateBookmarkDto>): Promise<CreateBookmarkOutputDto> {
    //     const bookmark = await this.dataService.bookmarks.get({where:{url:createBookmarkDto.url}})

    //     if(bookmark) {
    //         throw new Error('Bookmark is aleady exist')
    //     }
    //     const createdBookmark = await this.dataService.bookmarks.save(
    //         this.dataService.bookmarks.create({
    //             url:createBookmarkDto.url,
    //             userId:userId,
    //             tags:createBookmarkDto.tags
    //         })
    //     );

    //     return { bookmark: createdBookmark }
    // }

    async editBookmarkUrl(userId: number, bookmarkId: number, changeUrl: string) {
        let bookmark = await this.findBookmark(userId, bookmarkId);
        bookmark.url = changeUrl;
        await this.dataService.bookmarks.update(bookmarkId, bookmark)
        return { message: 'Updated' }
    }

    async deleteBookmark(userId: number, bookmarkId: number) {
        this.findBookmark(userId, bookmarkId)
        await this.dataService.bookmarks.delete(bookmarkId)
        return { message: 'Deleted' }
    }

    async findBookmark(userId: number, bookmarkId: number): Promise<Bookmark> {
        
        const bookmark = await this.dataService.bookmarks.getUserBookmark(userId, bookmarkId);
        
        if (!bookmark) {
            //throw new Error('Bookmark not found');
            throw new HttpException('Bookmark not found', 401)
        };
        return bookmark;
    }



    // getUserById(id:any): Promise<User> {
    //     return this.dataService.users.get(id);
    // }
}