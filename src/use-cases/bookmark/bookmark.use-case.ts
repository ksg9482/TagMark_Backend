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

/*
처음에는 그냥 방어적으로 에러 나올만한 부분에 예외처리
그 다음에는 트라이 캐치에 넣어놓으면 캐치로 들어가니까 컨트롤러에만 트라이캐치해서 잡게 만들었다.
지금은 함수를 트라이캐치블로에 넣는걸로 한다. 왜? 에러 처리할때 그게 더 명확히 할 수 있으니까.

트라이캐치 범벅인건 어떻게 보일러 플레이트인데? 래핑할 생각. 


연동 db연결.
프론트엔드 페이지, 블럭, 아톰 나누기.
인터페이스 정리
안쓰는거 정리해서 ver2넘길 준비
ws 뒤에 was 놔두기
도커에 넣기
서버는 ec2 프론트는 s3로.


*/
 //어떻게 첫 로그인을 구분할 것인가? 로그인 -> loginSync API -> 해당 userId 북마크수 확인
 // post {body:{bookmarkCount:00}} DB연결과 수 다르면 local 기준으로 갱신. -> 처음로그인은 local 여러개, db에는 0개 
 //차이있으니까 unSynced 반환 -> 로컬에 있는 거 배열로 전송 -> 대용량 방법으로. 복수 테이블에 해야함.
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