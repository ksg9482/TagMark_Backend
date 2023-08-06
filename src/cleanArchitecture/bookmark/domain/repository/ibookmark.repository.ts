import { Page } from 'src/use-cases/bookmark/bookmark.pagination';
import { Bookmark } from 'src/cleanArchitecture/bookmark/domain/bookmark';
import { IGenericRepository } from 'src/cleanArchitecture/common/domain/repository/igeneric-repository';
import { Tag } from 'src/cleanArchitecture/tag/domain/tag';

export interface IBookmarkRepository extends IGenericRepository<Bookmark> {
  save: (url: string, userId: string, tags: Tag[]) => Promise<Bookmark>;
  getUserBookmark: (
    userId: string,
    bookmarkId: string,
  ) => Promise<Bookmark | null>;
  getBookmarkByUrl: (url: string) => Promise<Bookmark | null>;
  getUserAllBookmarks: (userId: string, page: any) => Promise<Page<Bookmark>>;
  findBookmarkTag_OR: (
    userId: string,
    tags: string[],
    page: any,
  ) => Promise<Page<Bookmark>>;
  findBookmarkTag_AND: (
    userId: string,
    tags: string[],
    page: any,
  ) => Promise<Page<Bookmark>>;
  getcount: (userId: string) => Promise<any>;
  syncBookmark: (bookmarks: Bookmark[]) => Promise<Bookmark[]>;
  attachbulk: (BookmarkTagMap: any) => Promise<any>;
}
