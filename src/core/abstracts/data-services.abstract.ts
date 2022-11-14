import { User, Bookmark, Tag } from '../entities';
import { GenericRepository } from './generic-repository.abstract';

export abstract class DataServices {
  abstract users: GenericRepository<User>;

  abstract bookmarks: GenericRepository<Bookmark>;

  abstract tags: GenericRepository<Tag>;
}
