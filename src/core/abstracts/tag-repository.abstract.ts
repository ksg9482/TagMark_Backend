// import { Page } from 'src/use-cases/bookmark/bookmark.pagination';
// import { Bookmark, Tag } from '../entities';
// import { GenericRepository } from './generic-repository.abstract';

// export abstract class TagRepository extends GenericRepository<Tag> {
//   abstract create(item: Partial<Tag>): Promise<Tag>;
//   abstract getUserAllTags(userId: number): Promise<Tag[]>;
//   abstract getTagSeatchOR(
//     userId: number,
//     tags: string[],
//     page: any,
//   ): Promise<Page<Bookmark>>;
//   abstract getTagSearchAND(
//     userId: number,
//     tags: string[],
//     page: any,
//   ): Promise<Page<Bookmark>>;
//   abstract attachTag(bookmarkId: number, tags: Tag[]): Promise<any[]>;
//   abstract detachTag(bookmarkId: number, tagIds: number[]): Promise<string>;
//   abstract getTagsByIds(tagId: number[]): Promise<Tag[]>;
//   abstract insertBulk(tags: Tag[]): Promise<any>;
//   abstract createForm(item: Partial<Tag>): Tag;
//   abstract findByTagNames(tagNames: string[]): Promise<Tag[]>;
// }
