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
import {
  BookmarkSaveDto,
  IBookmarkRepository,
} from 'src/bookmark/domain/repository/ibookmark.repository';
import { TagFactory } from 'src/tag/domain/tag.factory';
import { UtilsService } from 'src/utils/utils.service';
import { Tag } from 'src/tag/domain/tag';
import { Tags } from 'src/tag/domain/tags';
import { Bookmarks } from '../domain/bookmarks';
import { TagUseCases } from 'src/tag/application/tag.use-case';

//DTO 의존성 해소용.
type UserAllBookmarks = PageRequest;
type SearchTags = PageRequest;

export class BookmarkUseCases {
  constructor(
    @Inject('BookmarkRepository')
    private bookmarkRepository: IBookmarkRepository,
    private tagUseCases: TagUseCases,
    private utilsService: UtilsService,
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

    if (tagNames !== undefined) {
      const tags = await this.tagUseCases.getTagsByNames(tagNames);
      await this.tagUseCases.attachTag(createdBookmark.id, tags);
    }

    return createdBookmark;
  }

  async getUserAllBookmarks(userId: string, page: UserAllBookmarks) {
    const limit = page.getLimit();
    const offset = page.getOffset();

    const bookmarks = await this.bookmarkRepository.getUserAllBookmarks(
      userId,
      {
        take: limit,
        skip: offset,
      },
    );
    return bookmarks;
  }

  async getUserBookmarkCount(userId: string) {
    const { count } = await this.bookmarkRepository.getcount(userId);
    return count;
  }

  async syncBookmark(bookmarks: Bookmarks) {
    const bookmarkInsert = await this.bookmarkRepository.syncBookmark(
      bookmarks.bookmarks,
    );
    await this.saveBookmarkTag(new Bookmarks(bookmarkInsert));
    return bookmarkInsert;
  }

  async editBookmarkUrl(userId: string, bookmarkId: string, changeUrl: string) {
    const bookmark = await this.findBookmark(userId, bookmarkId);
    bookmark.updateUrl(changeUrl);
    // bookmark.url = changeUrl;
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
  ) {
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

  protected async saveBookmarkTag(bookmarks: Bookmarks) {
    const bookmarksAndTags: any = this.getBookmarkIdAndTagId(bookmarks);
    const bookmarksAndTagsMap = this.getBookmarkTagMap(bookmarksAndTags);
    const result = await this.bookmarkRepository.attachbulk(
      bookmarksAndTagsMap,
    );

    return result;
  }

  protected getBookmarkIdAndTagId(bookmarks: Bookmarks) {
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
