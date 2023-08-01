import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Tag } from 'src/cleanArchitecture/tag/domain/tag';
import { Bookmark } from './bookmark';

@Injectable()
export class BookmarkFactory {
  //constructor(private eventBus: EventBus) {}

  create(id: string, url: string, userId: string, tags?: Tag[]): Bookmark {
    const bookmark = new Bookmark(id, url, userId, tags);
    return bookmark;
  }

  reconstitute(id: string, url: string, userId: string, tags: Tag[]): Bookmark {
    return new Bookmark(id, url, userId, tags);
  }
}
