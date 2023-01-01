import { Tag } from '../entities';
import { BookmarkRepository } from './bookmark-repository.abstract';
import { GenericRepository } from './generic-repository.abstract';
import { TagRepository } from './tag-repository.abstract';
import { UserRepository } from './user-repository.abstract';

export abstract class DataServices {
  abstract users: UserRepository;

  abstract bookmarks: BookmarkRepository;

  abstract tags: TagRepository;
}
