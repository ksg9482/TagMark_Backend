import { Repository } from 'typeorm';
import { User, Bookmark, Tag } from '../entities';
import { GenericRepository } from './generic-repository.abstract';
import { UserRepository } from './user-repository.abstract';

export abstract class DataServices {
  abstract users: UserRepository;

  abstract bookmarks: GenericRepository<Bookmark>;

  abstract tags: GenericRepository<Tag>;
}
