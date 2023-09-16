import { Injectable } from '@nestjs/common';
import { Tag } from 'src/tag/domain/tag';
import { Bookmark } from './bookmark';

@Injectable()
export class BookmarkFactory {
  create(id: string, url: string, userId: string, tags?: Tag[]): Bookmark {
    const bookmark = new Bookmark(id, userId, url, tags);
    return bookmark;
  }

  reconstitute(id: string, url: string, userId: string, tags: Tag[]): Bookmark {
    return new Bookmark(id, userId, url, tags);
  }
}
