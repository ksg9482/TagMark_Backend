import {
  BookmarkPage,
  Page,
} from 'src/bookmark/application/bookmark.pagination';
import { Bookmark } from 'src/bookmark/domain/bookmark';
import { IGenericRepository } from 'src/common/domain/repository/igeneric-repository';
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
export interface IBookmarkRepository {
  getAll: () => Promise<Bookmark[]>;
  get: (id: string) => Promise<Bookmark | null>;
  save: (item: BookmarkSaveDto) => Promise<any>;
  update: (id: string, item: Partial<Bookmark>) => Promise<any>;
  delete: (id: string) => Promise<any>;
  getUserBookmark: (
    userId: string,
    bookmarkId: string,
  ) => Promise<Bookmark | null>;
  getBookmarkByUrl: (url: string) => Promise<Bookmark | null>;
  getUserAllBookmarks: (userId: string, page: any) => Promise<BookmarkPage>;
  findBookmarkTag_OR: (
    userId: string,
    tags: string[],
    page: any,
  ) => Promise<BookmarkPage>;
  findBookmarkTag_AND: (
    userId: string,
    tags: string[],
    page: any,
  ) => Promise<BookmarkPage>;
  getcount: (userId: string) => Promise<any>;
  syncBookmark: (bookmarks: Bookmark[]) => Promise<Bookmark[]>;
  attachbulk: (BookmarkTagMap: any) => Promise<any>;
}
