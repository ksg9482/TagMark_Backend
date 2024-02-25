import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Bookmark } from 'src/bookmark/domain/bookmark';
import {
  BookmarkPage,
  Page,
  PageRequest,
} from 'src/bookmark/application/bookmark.pagination';
import {
  BookmarkAndTag,
  BookmarkTagMap,
} from 'src/bookmark/domain/bookmark.interface';
import {
  BookmarkSaveDto,
  BookmarkRepository,
} from 'src/bookmark/domain/repository/bookmark.repository';
import { TagFactory } from 'src/tag/domain/tag.factory';
import { UtilsService } from 'src/utils/utils.service';
import { Tag } from 'src/tag/domain/tag';
import { Tags } from 'src/tag/domain/tags';
import { Bookmarks } from '../domain/bookmarks';
import { TagUseCase } from 'src/tag/application/tag.use-case';

type UserAllBookmarks = PageRequest;
type SearchTags = PageRequest;

export abstract class BookmarkUseCase {
  createBookmark: (
    userId: string,
    url: string,
    tagNames?: string[],
  ) => Promise<Bookmark>;

  getUserAllBookmarks: (
    userId: string,
    page: UserAllBookmarks,
  ) => Promise<BookmarkPage>;

  getUserBookmarkCount: (userId: string) => Promise<Number>;

  syncBookmark: (bookmarks: Bookmarks) => Promise<Bookmark[]>;

  editBookmarkUrl: (
    userId: string,
    bookmarkId: string,
    changeUrl: string,
  ) => Promise<{
    message: string;
  }>;

  deleteBookmark: (
    userId: string,
    bookmarkId: string,
  ) => Promise<{
    message: string;
  }>;

  findBookmark: (userId: string, bookmarkId: string) => Promise<Bookmark>;

  getTagAllBookmarksOR: (
    userId: string,
    tags: string[],
    page: SearchTags,
  ) => Promise<BookmarkPage>;

  getTagAllBookmarksAND: (
    userId: string,
    tags: string[],
    page: SearchTags,
  ) => Promise<BookmarkPage>;

  saveBookmarkTag: (bookmarks: Bookmarks) => Promise<any>;

  getBookmarkIdAndTagId: (bookmarks: Bookmarks) => {
    bookmarkId: string;
    tagIds: string[];
  }[];

  getBookmarkTagMap: (bookmarksAndTags: BookmarkAndTag[]) => BookmarkTagMap[];

  setSyncBookmarkForm: (
    userId: string,
    bookmarks: Bookmark[],
    tags: Tags,
  ) => Bookmark[];
}

@Injectable()
export class BookmarkUseCaseImpl implements BookmarkUseCase {
  constructor(
    @Inject('BookmarkRepository')
    private bookmarkRepository: BookmarkRepository,
    private tagUseCase: TagUseCase,
  ) {}

  async createBookmark(
    userId: string,
    url: string,
    tagNames?: string[],
  ): Promise<Bookmark> {
    const findBookmark = await this.bookmarkRepository.getBookmarkByUrl(url);

    if (findBookmark !== null) {
      throw new HttpException(
        'Bookmark is aleady exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const createdBookmark = await this.bookmarkRepository.save(
      new BookmarkSaveDto({
        userId: userId,
        url: url,
      }),
    );
    console.log(`createBookmark - boomark saved`);
    const emptyTags = new Tags([]);

    const bookmark = new Bookmark(
      createdBookmark.id,
      createdBookmark.userId,
      createdBookmark.url,
      emptyTags,
    );

    if (tagNames !== undefined) {
      console.log(tagNames);
      const tags = await this.tagUseCase.getTagsByNames(tagNames);
      console.log(`createBookmark - ${tags} ${tags.tags}`);

      bookmark.updateTags(tags);

      await this.tagUseCase.attachTag(createdBookmark.id, tags);
    }

    return bookmark;
  }

  async getUserAllBookmarks(
    userId: string,
    page: UserAllBookmarks,
  ): Promise<BookmarkPage> {
    const bookmarks = await this.bookmarkRepository.getUserAllBookmarks(
      userId,
      {
        take: page.getLimit(),
        skip: page.getOffset(),
      },
    );

    return bookmarks;
  }

  async getUserBookmarkCount(userId: string): Promise<Number> {
    const { count } = await this.bookmarkRepository.getcount(userId);
    return count;
  }

  async syncBookmark(bookmarks: Bookmarks) {
    const bookmarkInsert = await this.bookmarkRepository.syncBookmark(
      bookmarks.bookmarks,
    );
    const syncedBookmarks = new Bookmarks(bookmarkInsert);
    await this.saveBookmarkTag(syncedBookmarks);
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

  async getTagAllBookmarksOR(
    userId: string,
    tags: string[],
    page: SearchTags,
  ): Promise<BookmarkPage> {
    const bookmarks = await this.bookmarkRepository.findBookmarkTag_OR(
      userId,
      tags,
      {
        take: page.getLimit(),
        skip: page.getOffset(),
      },
    );
    return bookmarks;
  }

  async getTagAllBookmarksAND(
    userId: string,
    tags: string[],
    page: SearchTags,
  ): Promise<BookmarkPage> {
    const bookmarks = await this.bookmarkRepository.findBookmarkTag_AND(
      userId,
      tags,
      {
        take: page.getLimit(),
        skip: page.getOffset(),
      },
    );
    return bookmarks;
  }

  //protected
  async saveBookmarkTag(bookmarks: Bookmarks) {
    const bookmarksAndTags: any = this.getBookmarkIdAndTagId(bookmarks);
    const bookmarksAndTagsMap = this.getBookmarkTagMap(bookmarksAndTags);
    const result = await this.bookmarkRepository.attachbulk(
      bookmarksAndTagsMap,
    );

    return result;
  }

  //protected
  getBookmarkIdAndTagId(bookmarks: Bookmarks) {
    const result = bookmarks.bookmarks.map((bookmark) => {
      const bookmarkTags = bookmark.tags;
      const bookmarkId = bookmark.id;
      const tagIds = bookmarkTags.map((tag) => {
        return tag.id;
      });
      return { bookmarkId, tagIds };
    });
    return result;
  }

  //protected
  getBookmarkTagMap(bookmarksAndTags: BookmarkAndTag[]) {
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
    bookmarks: Bookmark[],
    tags: Tags,
  ): Bookmark[] {
    const result = bookmarks.map((bookmark) => {
      const localTags = bookmark.tags;
      const changedTags = localTags.map((localtag) => {
        const targetTag = tags.tags.find((dbTag) => {
          return dbTag.tag === localtag.tag;
        });

        return targetTag;
      });

      const filtered = changedTags.filter((tag): tag is Tag => {
        if (tag !== undefined) {
          return true;
        }
        return false;
      });

      return Bookmark.from(
        bookmark.id,
        userId,
        bookmark.url,
        new Tags(filtered),
      );
    });
    return result;
  }
}
