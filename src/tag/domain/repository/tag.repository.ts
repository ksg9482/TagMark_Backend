import { Tag } from 'src/tag/domain/tag';
import { AttachTagDto } from 'src/tag/infra/db/dto/attach-tag.dto';
import { DeleteDto } from 'src/tag/infra/db/dto/delete.dto';
import { DetachTagDto } from 'src/tag/infra/db/dto/detach-tag.dto';
import { GetAllDto } from 'src/tag/infra/db/dto/get-all.dto';
import { GetDto } from 'src/tag/infra/db/dto/get.dto';
import { InsertBulkDto } from 'src/tag/infra/db/dto/insert-bulk.dto';
import { SaveDto } from 'src/tag/infra/db/dto/save.dto';
import { TagWithCountsDto } from 'src/tag/infra/db/dto/tag-with-count.dto';
import { UpdateDto } from 'src/tag/infra/db/dto/update.dto';
import { Tags } from '../tags';

export interface TagRepository {
  getAll: () => Promise<GetAllDto>;
  get: (id: string) => Promise<GetDto | null>;
  save: (item: Omit<Tag, 'id'>) => Promise<SaveDto>;
  update: (id: string, item: Partial<Tag>) => Promise<UpdateDto>;
  delete: (id: string) => Promise<DeleteDto>;
  getUserAllTags: (userId: string) => Promise<TagWithCountsDto>;
  attachTag: (bookmarkId: string, tags: Tags) => Promise<AttachTagDto>;
  detachTag: (bookmarkId: string, tagIds: string[]) => Promise<DetachTagDto>;
  getTagsByIds: (tagId: string[]) => Promise<GetAllDto>;
  insertBulk: (tags: Tags) => Promise<InsertBulkDto>;
  findByTagNames: (tagNames: string[]) => Promise<GetAllDto>;
}
