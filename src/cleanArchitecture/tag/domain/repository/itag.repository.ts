import { Tag } from 'src/cleanArchitecture/tag/domain/tag';
import { Page } from 'src/cleanArchitecture/bookmark/application/bookmark.pagination';
import { Bookmark } from 'src/cleanArchitecture/bookmark/domain/bookmark';
import { IGenericRepository } from 'src/cleanArchitecture/common/domain/repository/igeneric-repository';

export interface ITagRepository extends IGenericRepository<Tag> {
  createTag: (item: string) => Promise<Tag>;
  getAllTags: () => Promise<Tag[]>;
  getUserAllTags: (userId: number) => Promise<Tag[]>;
  getTagSeatchOR: (
    userId: number,
    tags: string[],
    page: any,
  ) => Promise<Page<Bookmark>>;
  getTagSearchAND: (
    userId: number,
    tags: string[],
    page: any,
  ) => Promise<Page<Bookmark>>;
  attachTag: (bookmarkId: number, tags: Tag[]) => Promise<any[]>;
  detachTag: (bookmarkId: number, tagIds: number[]) => Promise<string>;
  getTagsByIds: (tagId: number[]) => Promise<Tag[]>;
  insertBulk: (tags: Tag[]) => Promise<any>;
  createForm: (tag: string) => Tag;
  findByTagNames: (tagNames: string[]) => Promise<Tag[]>;
}
