import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { DataServices } from 'src/core/abstracts';
import {
  CreateBookmarkDto,
  GetUserAllBookmarksDto,
} from 'src/controllers/dtos';
import { Bookmark } from 'src/cleanArchitecture/bookmark/domain/bookmark';
import { Page } from './bookmark.pagination';
import {
  BookmarkAndTag,
  BookmarkTagMap,
} from 'src/cleanArchitecture/bookmark/domain/bookmark.interface';
import { IBookmarkRepository } from '../domain/repository/ibookmark.repository';
import { BookmarkFactory } from '../domain/bookmark.factory';
import { GetSearchTagsDto } from 'src/cleanArchitecture/tag/interface/dto';

export class BookmarkUseCases {
  constructor(
    @Inject(DataServices)
    private dataService: DataServices,
    private bookmarkRepository: IBookmarkRepository,
  ) {}

  async createBookmark(
    userId: string,
    createBookmarkDto: CreateBookmarkDto,
  ): Promise<Bookmark> {
    const { tagNames, url } = createBookmarkDto;
    const bookmark = await this.bookmarkCheck(url);

    if (bookmark) {
      throw new HttpException(
        'Bookmark is aleady exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const createdBookmark = await this.bookmarkRepository.create({
      id: 'temp',
      url: url,
      userId: userId,
      tags: tagNames as any,
    });

    return createdBookmark;
  }

  async getUserAllBookmarks(userId: string, page: GetUserAllBookmarksDto) {
    const limit = page.getLimit();
    const offset = page.getOffset();

    const bookmarks: Page<Bookmark> =
      await this.bookmarkRepository.getUserAllBookmarks(userId, {
        take: limit,
        skip: offset,
      });

    // const bookmarksForm = this.bookmarksNullCheck(bookmarks.bookmarks);

    return bookmarks;
    // return { ...bookmarks, bookmarks: bookmarksForm };
  }

  async getUserBookmarkCount(userId: string) {
    const { count } = await this.bookmarkRepository.getcount(userId);
    return count;
  }

  async syncBookmark(bookmarks: Bookmark[]) {
    const bookmarkInsert = await this.bookmarkRepository.syncBookmark(
      bookmarks,
    );

    await this.saveBookmarkTag(bookmarkInsert);

    return bookmarkInsert;
  }

  async editBookmarkUrl(userId: string, bookmarkId: string, changeUrl: string) {
    const bookmark = await this.findBookmark(userId, bookmarkId);
    bookmark.updateUrl(changeUrl);
    await this.bookmarkRepository.update(bookmarkId, bookmark);
    return { message: 'Updated' };
  }

  async deleteBookmark(userId: string, bookmarkId: string) {
    await this.findBookmark(userId, bookmarkId);
    await this.bookmarkRepository.delete(bookmarkId);

    return { message: 'Deleted' };
  }

  async findBookmark(userId: string, bookmarkId: string): Promise<Bookmark> {
    const bookmark = await this.bookmarkRepository.getUserBookmark(
      userId,
      bookmarkId,
    );

    if (!bookmark) {
      throw new HttpException('Bookmark not found', HttpStatus.BAD_REQUEST);
    }

    return bookmark;
  }

  //OR과 AND는 북마크와 태그가 함께 사용되니 별도의 클래스로 분리하는게 맞지 않을까?
  async getTagAllBookmarksOR(
    userId: string,
    tags: string[],
    page: GetSearchTagsDto, //이거 인터페이스에서 오면 의존성이 어긋나는데? 인터페이스가 바깥인데 바깥 참조함
  ): Promise<Page<Bookmark>> {
    const limit = page.getLimit();
    const offset = page.getOffset();
    const bookmarks = await this.bookmarkRepository.findBookmarkTag_OR(
      userId,
      tags,
      {
        take: limit,
        skip: offset,
      },
    );
    return bookmarks;
  }

  async getTagAllBookmarksAND(
    userId: string,
    tags: string[],
    page: GetSearchTagsDto,
  ): Promise<Page<Bookmark>> {
    const limit = page.getLimit();
    const offset = page.getOffset();
    const bookmarks = await this.bookmarkRepository.findBookmarkTag_AND(
      userId,
      tags,
      {
        take: limit,
        skip: offset,
      },
    );
    return bookmarks;
  }

  protected async bookmarkCheck(url: string) {
    const bookmark = await this.bookmarkRepository.getBookmarkByUrl(url);

    return bookmark;
  }

  //안티패턴 - 배열을 다룰때는 null이 아니라 빈배열을 주는 게 낫다.
  // protected bookmarksNullCheck(bookmarks: Bookmark[]) {
  //     const result = bookmarks.map((bookmark) => {
  //         const bookmarkTags = bookmark.getTags()
  //         if (Array.isArray(bookmarkTags) && !bookmarkTags[0]) bookmark.tags = [] as any;
  //         return bookmark;
  //     });

  //     return result;
  // };

  protected async saveBookmarkTag(bookmarks: Bookmark[]) {
    const bookmarksAndTags: any = this.getBookmarkIdAndTagId(bookmarks);
    const bookmarksAndTagsMap = this.getBookmarkTagMap(bookmarksAndTags);

    const result = await this.bookmarkRepository.attachbulk(
      bookmarksAndTagsMap,
    );

    return result;
  }

  protected getBookmarkIdAndTagId(bookmarks: Bookmark[]) {
    const result = bookmarks.map((bookmark) => {
      const bookmarkTags = bookmark.getTags();
      if (!Array.isArray(bookmarkTags)) return;

      const bookmarkId = bookmark.getId();
      //앞 단에 예외 및 빈 배열 처리를 해서 반환하는 게 낫다.
      const tagIds = bookmarkTags!.map((tag) => {
        return tag.id;
      });

      return { bookmarkId, tagIds };
    });
    return result;
  }

  protected getBookmarkTagMap(bookmarksAndTags: BookmarkAndTag[]) {
    const bookmarkTagMap: BookmarkTagMap[] = [];

    for (const bookmarksTags of bookmarksAndTags) {
      for (const tagId of bookmarksTags.tagIds) {
        bookmarkTagMap.push({
          bookmarkId: bookmarksTags.bookmarkId,
          tagId: tagId,
        });
      }
    }

    return bookmarkTagMap;
  }
}
