import { Bookmarks_TagsEntity } from 'src/cleanArchitecture/bookmark/infra/db/entity/bookmarks_tags.entity';

export interface BookmarkAndTag
  extends Pick<Bookmarks_TagsEntity, 'bookmarkId'> {
  tagIds: string[];
}

export type BookmarkTagMap = Pick<Bookmarks_TagsEntity, 'bookmarkId' | 'tagId'>;
