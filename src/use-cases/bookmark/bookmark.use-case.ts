import { HttpException, HttpStatus, Inject } from "@nestjs/common";
import { DataServices } from "src/core/abstracts";
import { CreateBookmarkDto, GetUserAllBookmarksDto } from "src/controllers/dtos";
import { Bookmark } from "src/core/entities";
import { Page } from "./bookmark.pagination";


export class BookmarkUseCases {
    constructor(
        @Inject(DataServices)
        private dataService: DataServices,
    ) { }
    //2가지 역할임. 분리. url로 찾기, 저장
    async createBookmark(userId: number, createBookmarkDto: CreateBookmarkDto): Promise<Bookmark> {
        const { tagNames, url } = createBookmarkDto;
        const bookmark = await this.dataService.bookmarks.getBookmarkByUrl(url)
        if (bookmark) {
            throw new HttpException('Bookmark is aleady exist', HttpStatus.BAD_REQUEST)
        }
        //이거 조인테이블에 저장하도록 바꿘야됨
        const createdBookmark = await this.dataService.bookmarks.create({
            url: url,
            userId: userId,
            tags: tagNames
        });

        return createdBookmark;
    }

    async getAllBookmarks() {
        return await this.dataService.bookmarks.getAll()
    }

    async getUserAllBookmarks(userId: number, page: GetUserAllBookmarksDto) {
        const limit = page.getLimit()
        const offset = page.getOffset()
        
        const bookmarks: Page<Bookmark> = await this.dataService.bookmarks.getUserAllBookmarks(
            userId,
            {
                take: limit,
                skip: offset
            }
        );
        const bookmarksForm = bookmarks.bookmarks.map(this.bookmarkNullCheck)
        return {...bookmarks, bookmarks:bookmarksForm}
    }
    //맵에 이 함수를 적용시키느냐? 이 함수에 들어오면 맵을 돌려 반환하느냐?
    protected bookmarkNullCheck(bookmark:Bookmark) {
        if (!bookmark.tags[0]) {
            bookmark.tags = null
        }
        return bookmark
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
        await this.findBookmark(userId, bookmarkId)
        await this.dataService.bookmarks.delete(bookmarkId)
        return { message: 'Deleted' }
    }

    async findBookmark(userId: number, bookmarkId: number): Promise<Bookmark> {
        const bookmark = await this.dataService.bookmarks.getUserBookmark(userId, bookmarkId);
        
        if (!bookmark) {
            throw new HttpException('Bookmark not found', HttpStatus.BAD_REQUEST)
        };

        return bookmark;
    }

}