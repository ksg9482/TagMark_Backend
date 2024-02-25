import { Tag } from 'src/tag/domain/tag';
import { IGenericRepository } from 'src/common/domain/repository/igeneric-repository';
import { TagWithCount } from 'src/tag/domain/tag.interface';
import { Tags } from '../tags';

export interface TagRepository {
  getAll: () => Promise<Tags>;
  get: (id: string) => Promise<Tag | null>;
  save: (item: Omit<Tag, 'id'>) => Promise<any>;
  update: (id: string, item: Partial<Tag>) => Promise<any>;
  delete: (id: string) => Promise<any>;
  getUserAllTags: (userId: string) => Promise<TagWithCount[]>;
  attachTag: (bookmarkId: string, tags: Tags) => Promise<any[]>;
  detachTag: (bookmarkId: string, tagIds: string[]) => Promise<string>;
  getTagsByIds: (tagId: string[]) => Promise<Tags>;
  insertBulk: (tags: Tags) => Promise<any>;
  findByTagNames: (tagNames: string[]) => Promise<Tags>;
}
