import { Tag } from 'src/cleanArchitecture/tag/domain/tag';
import { Page } from 'src/cleanArchitecture/bookmark/application/bookmark.pagination';
import { Bookmark } from 'src/cleanArchitecture/bookmark/domain/bookmark';

export interface TagRepository {
  createTag: (item: Partial<Tag>) => Promise<Tag>;
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
  createForm: (item: Partial<Tag>) => Tag;
  findByTagNames: (tagNames: string[]) => Promise<Tag[]>;
}
