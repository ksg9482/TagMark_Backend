import { Bookmarks_Tags } from "src/frameworks/data-services/postgresql/model";

export interface BookmarkAndTag extends Pick<Bookmarks_Tags, 'bookmarkId'> {
    tagIds: number[];
};

export interface BookmarkTagMap extends Pick<Bookmarks_Tags, 'bookmarkId' | 'tagId'> { };
