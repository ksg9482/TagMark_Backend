import { Injectable } from '@nestjs/common';
import { Tag } from 'src/tag/domain/tag';
import { Tags } from 'src/tag/domain/tags';
import { Bookmark } from './bookmark';

@Injectable()
export class BookmarkFactory {
  create(id: string, url: string, userId: string, tags?: Tags): Bookmark {
    const bookmark = Bookmark.from(id, userId, url, tags);
    return bookmark;
  }

  reconstitute(id: string, url: string, userId: string, tags?: Tags): Bookmark {
    return Bookmark.from(id, userId, url, tags);
  }
}
