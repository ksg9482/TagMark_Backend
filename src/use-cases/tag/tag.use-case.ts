import { Inject } from '@nestjs/common';
import { DataServices } from 'src/core/abstracts';
import { CreateTagDto } from 'src/controllers/dtos';
import { GetSearchTagsDto } from 'src/controllers/dtos/tag/get-search-tags.dto copy';
import { Bookmark, Tag } from 'src/core/entities';
import { Page } from '../bookmark';
import { TagWithCount } from '../interfaces/tag.interface';

export class TagUseCases {
  constructor(
    @Inject(DataServices)
    private dataService: DataServices,
  ) {}

  async getAllTags(): Promise<Tag[]> {
    const tags = await this.dataService.tags.getAll();
    return tags;
  }

  async createTag(createTagDto: CreateTagDto): Promise<Tag> {
    const tagCheck = await this.getTagsByNames(createTagDto.tag);
    if (tagCheck) {
      return tagCheck[0];
    }

    const createdTag = await this.dataService.tags.create(createTagDto);

    return createdTag;
  }

  async getTagsByNames(tagName: string | string[]): Promise<Tag[]> {
    if (!Array.isArray(tagName)) {
      tagName = [tagName];
    }
    const tags = await this.tagFindOrCreate(tagName);

    return tags;
  }

  protected async tagFindOrCreate(tagNames: string[]): Promise<Tag[]> {
    let tags: Tag[] = await this.dataService.tags.findByTagNames(tagNames);

    const tagFilter = this.tagFilter(tags, tagNames);
    if (tagFilter) {
      const createTags = tagFilter.map((tag) => {
        return this.dataService.tags.createForm({ tag: tag });
      });
      await this.dataService.tags.insertBulk(createTags);

      tags = [...tags, ...createTags];
    }

    return tags;
  }

  async attachTag(bookmarkId: number, tags: Tag[]): Promise<any[]> {
    const attach = await this.dataService.tags.attachTag(bookmarkId, tags);

    return attach;
  }

  async detachTag(
    bookmarkId: number,
    tagId: number | number[],
  ): Promise<string> {
    if (!Array.isArray(tagId)) {
      tagId = [tagId];
    }

    await this.dataService.tags.detachTag(bookmarkId, tagId);
    return 'Deleted';
  }

  async getTagsByIds(tagId: number | number[]): Promise<Tag[]> {
    if (!Array.isArray(tagId)) {
      tagId = [tagId];
    }
    const tags = await this.dataService.tags.getTagsByIds(tagId);
    return tags;
  }

  async getUserAllTags(userId: number): Promise<TagWithCount[]> {
    const tags: any[] = await this.dataService.tags.getUserAllTags(userId);
    const countForm: TagWithCount[] = tags.map((tag) => {
      return { ...tag, count: Number(tag['count']) };
    });
    return countForm;
  }

  async getTagAllBookmarksOR(
    userId: number,
    tags: string[],
    page: GetSearchTagsDto,
  ): Promise<Page<Bookmark>> {
    const limit = page.getLimit();
    const offset = page.getOffset();
    const bookmarks = await this.dataService.tags.getTagSeatchOR(userId, tags, {
      take: limit,
      skip: offset,
    });
    return bookmarks;
  }

  async getTagAllBookmarksAND(
    userId: number,
    tags: string[],
    page: GetSearchTagsDto,
  ): Promise<Page<Bookmark>> {
    const limit = page.getLimit();
    const offset = page.getOffset();
    const bookmarks = await this.dataService.tags.getTagSearchAND(
      userId,
      tags,
      {
        take: limit,
        skip: offset,
      },
    );
    return bookmarks;
  }

  protected tagFilter(finedTagArr: Tag[], inputTagArr: string[]): string[] {
    const tagArr = finedTagArr.map((tag) => {
      return tag.tag;
    });
    return inputTagArr.filter((tag) => !tagArr.includes(tag));
  }
}
