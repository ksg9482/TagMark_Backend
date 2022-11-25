import { QueryRunner, SelectQueryBuilder } from "typeorm";
import { Bookmark, Tag } from "../entities";
import { GenericRepository } from "./generic-repository.abstract";

export abstract class TagRepository extends GenericRepository<Tag> {
    
    abstract create(item: Partial<Tag>): Promise<Tag>
    abstract getUserAllTags(userId: number): Promise<Tag[]>
    abstract getTagSeatchOR(userId: number, tags: string[]): Promise<Bookmark[]>
    abstract getTagSearchAND(userId: number, tags: string[]): Promise<Bookmark[]>
    abstract attachTag(userId: number, bookmarkId: number, tags: Tag[])
    abstract detachTag(bookmarkId: number, tagIds:number[])
    abstract getTagsByIds(tagId: number[]):Promise<Tag[]>
    abstract insertBulk(tags: Tag[])
    abstract createForm(item: Partial<Tag>): Tag
    abstract findByTagNames(tagNames: string[]): Promise<Tag[]>
}