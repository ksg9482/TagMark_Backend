import { Tag } from 'src/tag/domain/tag';
import { IGenericRepository } from 'src/common/domain/repository/igeneric-repository';
import { TagWithCount } from 'src/tag/domain/tag.interface';
import { Tags } from '../tags';

export interface ITagRepository extends IGenericRepository<Tag> {
  getUserAllTags: (userId: string) => Promise<TagWithCount[]>;
  attachTag: (bookmarkId: string, tags: Tags) => Promise<any[]>;
  detachTag: (bookmarkId: string, tagIds: string[]) => Promise<string>;
  getTagsByIds: (tagId: string[]) => Promise<Tag[]>;
  insertBulk: (tags: Tag[]) => Promise<any>;
  findByTagNames: (tagNames: string[]) => Promise<Tag[]>;
}
