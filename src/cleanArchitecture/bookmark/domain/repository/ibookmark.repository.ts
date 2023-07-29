import { Page } from 'src/use-cases/bookmark/bookmark.pagination';
import { Bookmark } from 'src/cleanArchitecture/bookmark/domain/bookmark';
import { IGenericRepository } from 'src/cleanArchitecture/common/domain/repository/igeneric-repository';
import { Tag } from 'src/cleanArchitecture/tag/domain/tag';

export interface IBookmarkRepository extends IGenericRepository<Bookmark> {
  create: (createBookmark: {
    id: string;
    url: string;
    tags: Tag[];
    userId: string;
  }) => Promise<Bookmark>;
  save: (
    id: string,
    url: string,
    tags: Tag[],
    userId: string,
  ) => Promise<Bookmark>;
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
