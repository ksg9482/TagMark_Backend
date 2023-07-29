import { Tag } from 'src/cleanArchitecture/tag/domain/tag';
import { Page } from 'src/cleanArchitecture/bookmark/application/bookmark.pagination';
import { Bookmark } from 'src/cleanArchitecture/bookmark/domain/bookmark';
import { IGenericRepository } from 'src/cleanArchitecture/common/domain/repository/igeneric-repository';

export interface ITagRepository extends IGenericRepository<Tag> {
  save: (tag: string) => Promise<Tag>;
  getUserAllTags: (userId: string) => Promise<Tag[]>;
  attachTag: (bookmarkId: string, tags: Tag[]) => Promise<any[]>;
  detachTag: (bookmarkId: string, tagIds: string[]) => Promise<string>;
  getTagsByIds: (tagId: string[]) => Promise<Tag[]>;
  insertBulk: (tags: Tag[]) => Promise<any>;
  findByTagNames: (tagNames: string[]) => Promise<Tag[]>;
}
