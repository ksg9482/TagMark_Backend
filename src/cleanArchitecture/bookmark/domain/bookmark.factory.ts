import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Tag } from 'src/cleanArchitecture/tag/domain/tag';
import { Bookmark } from './bookmark';

@Injectable()
export class BookmarkFactory {
  //constructor(private eventBus: EventBus) {}

  create(id: string, url: string, tags: Tag[], userId: string): Bookmark {
    const bookmark = new Bookmark(id, url, tags, userId);
    return bookmark;
  }

  reconstitute(id: string, url: string, tags: Tag[], userId: string): Bookmark {
    return new Bookmark(id, url, tags, userId);
  }
}
