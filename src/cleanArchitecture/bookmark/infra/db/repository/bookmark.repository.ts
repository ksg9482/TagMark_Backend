import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Page } from 'src/use-cases/bookmark/bookmark.pagination';
import { BookmarkTagMap } from 'src/use-cases/interfaces/bookmark.interface';
import { IBookmarkRepository } from 'src/cleanArchitecture/bookmark/domain/repository/ibookmark.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity } from 'src/cleanArchitecture/tag/infra/db/entity/tag.entity';
import { TagFactory } from 'src/cleanArchitecture/tag/domain/tag.factory';
import { BookmarkEntity } from 'src/cleanArchitecture/bookmark/infra/db/entity/bookmark.entity';
import { BookmarkFactory } from 'src/cleanArchitecture/bookmark/domain/bookmark.factory';
import { Bookmark } from 'src/cleanArchitecture/bookmark/domain/bookmark';


@Injectable()
export class PostgresqlBookmarkRepository implements IBookmarkRepository {
  constructor(
    @InjectRepository(BookmarkEntity) private bookmarkRepository: Repository<BookmarkEntity>,
    private bookmarkFactory: BookmarkFactory,
  ) {
  }
  ;

  async create(item: Partial<Bookmark>): Promise<Bookmark> {
    return await this.bookmarkRepository.save(this.bookmarkRepository.create(item));
  };

  async update(id: number, item: Bookmark): Promise<any> {
    return await this.bookmarkRepository.update(id, item);
  };

  async getAll(): Promise<Bookmark[]> {
    return await this.bookmarkRepository.find({ relations: ['tags'] });
  };

  async getUserBookmark(userId: number, bookmarkId: number): Promise<Bookmark | null> {
    return await this.bookmarkRepository.findOne({
      where: {
        userId: userId,
        id: bookmarkId
      }
    });
  };

  async getBookmarkByUrl(url: string): Promise<Bookmark | null> {
    return await this.bookmarkRepository.findOne({
      where: {
        url: url
      }
    });
  }
  async getUserAllBookmarks(userId: number, page: any): Promise<Page<Bookmark>> {
    const tagProperty = () => {
      const id = `'id', "tag"."id"`;
      const tag = `'tag', "tag"."tag"`;

      return `${id},${tag}`;
    }
    const { count } = await this.getcount(userId);
    const bookmarks = await this.bookmarkRepository.createQueryBuilder('bookmark')
      .select(`"bookmark".*`)
      .addSelect(`array_agg(json_build_object(${tagProperty()}))`, 'tags')
      .leftJoin('bookmarks_tags', 'bookmarks_tags', 'bookmarks_tags.bookmarkId = bookmark.id')
      .leftJoin('tag', 'tag', 'tag.id = bookmarks_tags.tagId')
      .where(`"userId" = :userId`, { userId: userId })
      .groupBy("bookmark.id")
      .orderBy('bookmark."createdAt"', 'DESC')
      .limit(page.take)
      .offset(page.skip)
      .getRawMany();

    return new Page<Bookmark>(Number(count), page.take, bookmarks);
  }
  async getcount(userId: number): Promise<any> {
    const bookmarkCount = await this.bookmarkRepository.createQueryBuilder('bookmark')
      .select(`COUNT("bookmark".id)`)
      .where(`"userId" = :userId`, { userId: userId })
      .getRawMany();

    return bookmarkCount[0];
  }

  async syncBookmark(bookmarks: Bookmark[]): Promise<Bookmark[]> {
    const createdBookmarks = await this.bookmarkRepository.createQueryBuilder()
      .insert()
      .into(Bookmark)
      .values(bookmarks)
      .execute();

    const bookmarkIdAndTagIdArr = createdBookmarks.identifiers;
    const completedBookmarks = bookmarks.map((bookmark, i) => {
      return { ...bookmark, id: bookmarkIdAndTagIdArr[i].id }
    });

    return completedBookmarks;
  }

  async attachbulk(bookmarkTagMap: BookmarkTagMap[]): Promise<any> {

    const attachBookmark = await this.bookmarkRepository.createQueryBuilder()
      .insert()
      .into(Bookmarks_Tags)
      .values(bookmarkTagMap)
      .execute();

    return attachBookmark;
  }
}
