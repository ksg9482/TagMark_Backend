import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Tag } from './tag';

@Injectable()
export class TagFactory {
  // constructor(private eventBus: EventBus) {}

  create(id: string, tag: string): Tag {
    const createdTag = new Tag(id, tag);
    return createdTag;
  }

  reconstitute(id: string, tag: string): Tag {
    return new Tag(id, tag);
  }
}
