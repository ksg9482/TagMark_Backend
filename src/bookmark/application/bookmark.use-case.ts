import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Bookmark } from 'src/bookmark/domain/bookmark';
import {
  Page,
  PageRequest,
} from 'src/bookmark/application/bookmark.pagination';
import {
  BookmarkAndTag,
  BookmarkTagMap,
} from 'src/bookmark/domain/bookmark.interface';
import { IBookmarkRepository } from 'src/bookmark/domain/repository/ibookmark.repository';
import { TagFactory } from 'src/tag/domain/tag.factory';
import { UtilsService } from 'src/utils/utils.service';
import { Tag } from 'src/tag/domain/tag';

//DTO 의존성 해소용.
type UserAllBookmarks = PageRequest;
type SearchTags = PageRequest;

export class BookmarkUseCases {
  constructor(
    @Inject('BookmarkRepository')
    private bookmarkRepository: IBookmarkRepository,
    private utilsService: UtilsService,
  ) {}

  async createBookmark(
    userId: string,
    url: string,
    tagNames?: string[],
  ): Promise<Bookmark> {
    const bookmark = await this.bookmarkCheck(url);

    if (bookmark !== null) {
      throw new HttpException(
        'Bookmark is aleady exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (tagNames === undefined) {
      tagNames = [];
    }
    const tags = tagNames.map((tagName) => {
      const tag = new TagFactory().create(this.utilsService.getUuid(), tagName);
      return tag;
    });

    const createdBookmark = await this.bookmarkRepository.save({
      url: url,
      userId: userId,
      tags: tags,
    });

    return createdBookmark;
  }

  async getUserAllBookmarks(userId: string, page: UserAllBookmarks) {
    const limit = page.getLimit();
    const offset = page.getOffset();

    const bookmarks: Page<Bookmark> =
      await this.bookmarkRepository.getUserAllBookmarks(userId, {
        take: limit,
        skip: offset,
      });
    return bookmarks;
  }

  async getUserBookmarkCount(userId: string) {
    const { count } = await this.bookmarkRepository.getcount(userId);
    return count;
  }

  async syncBookmark(bookmarks: Bookmark[]) {
    bookmarks.map((bookmark) => {
      bookmark.id;
      return bookmark.id;
    });
    const bookmarkInsert = await this.bookmarkRepository.syncBookmark(
      bookmarks,
    );
    await this.saveBookmarkTag(bookmarkInsert);
    return bookmarkInsert;
  }

  async editBookmarkUrl(userId: string, bookmarkId: string, changeUrl: string) {
    const bookmark = await this.findBookmark(userId, bookmarkId);
    bookmark.url = changeUrl;
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

  async getTagAllBookmarksOR(
    userId: string,
    tags: string[],
    page: SearchTags,
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
    page: SearchTags,
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
      const bookmarkTags = bookmark.tags;
      const bookmarkId = bookmark.id;
      const tagIds = bookmarkTags.map((tag) => {
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
  setSyncBookmarkForm(
    userId: string,
    bookmarks: Partial<Bookmark>[],
    tags: Tag[],
  ): Bookmark[] {
    const result = bookmarks.map((bookmark) => {
      const localTags = bookmark.tags || [];
      const changedTags = localTags.map((localtag) => {
        const targetTag = tags.find((dbTag) => {
          return dbTag.tag === localtag.tag;
        });

        return targetTag;
      });

      return { ...bookmark, tags: changedTags, userId: userId };
    });
    return result as any;
  }
}
