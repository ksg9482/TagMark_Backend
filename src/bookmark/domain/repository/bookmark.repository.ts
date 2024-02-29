import { Bookmark } from 'src/bookmark/domain/bookmark';
import { BookmarkWithCountDto } from 'src/bookmark/infra/db/dto/bookmark-with-count.dto';
import { DeleteDto } from 'src/bookmark/infra/db/dto/delete.dto';
import { GetAllDto } from 'src/bookmark/infra/db/dto/get-all.dto';
import { GetDto } from 'src/bookmark/infra/db/dto/get.dto';
import { SaveDto } from 'src/bookmark/infra/db/dto/save.dto';
import { UpdateDto } from 'src/bookmark/infra/db/dto/update.dto';
interface BookmarkSaveData {
  userId: string;
  url: string;
}
export class BookmarkSaveDto {
  readonly #userId: string;
  readonly #url: string;

  constructor(bookmarkSaveDto: BookmarkSaveData) {
    this.#userId = bookmarkSaveDto.userId;
    this.#url = bookmarkSaveDto.url;
  }

  get userId() {
    return this.#userId;
  }
  get url() {
    return this.#url;
  }
}

export abstract class BookmarkRepository {
  getAll: () => Promise<GetAllDto>;
  save: (item: BookmarkSaveDto) => Promise<SaveDto>;
  update: (id: string, item: Partial<Bookmark>) => Promise<UpdateDto>;
  delete: (id: string) => Promise<DeleteDto>;
  getUserBookmark: (
    userId: string,
    bookmarkId: string,
  ) => Promise<GetDto | null>;
  getBookmarkByUrl: (url: string) => Promise<GetDto | null>;
  getUserAllBookmarks: (
    userId: string,
    page: any,
  ) => Promise<BookmarkWithCountDto>;
  findBookmarkTag_OR: (
    userId: string,
    tags: string[],
    page: any,
  ) => Promise<BookmarkWithCountDto>;
  findBookmarkTag_AND: (
    userId: string,
    tags: string[],
    page: any,
  ) => Promise<BookmarkWithCountDto>;
  getcount: (userId: string) => Promise<number>;
  syncBookmark: (bookmarks: Bookmark[]) => Promise<GetAllDto>;
  attachbulk: (BookmarkTagMap: any) => Promise<any>;
}
