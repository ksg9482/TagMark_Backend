import { Inject } from '@nestjs/common';
import { ITagRepository } from 'src/tag/domain/repository/itag.repository';
import { Tag } from 'src/tag/domain/tag';
import { TagWithCount } from 'src/tag/domain/tag.interface';
import { UtilsService } from 'src/utils/utils.service';
import { TagFactory } from '../domain/tag.factory';
import { Tags } from '../domain/tags';

export abstract class TagUseCases {
  getAllTags: () => Promise<Tag[]>;
  createTag: (tag: Omit<Tag, 'id'>) => Promise<Tag>;
  getTagsByNames: (tagName: string | string[]) => Promise<Tags>;
  attachTag: (bookmarkId: string, tags: Tags) => Promise<any[]>;
  detachTag: (bookmarkId: string, tagId: string | string[]) => Promise<string>;
  getTagsByIds: (tagId: string | string[]) => Promise<Tag[]>;
  getUserAllTags: (userId: string) => Promise<TagWithCount[]>;
  tagFindOrCreate: (tagNames: string[]) => Promise<Tags>;
}

export class TagUseCasesImpl implements TagUseCases {
  constructor(
    @Inject('TagRepository')
    private tagRepository: ITagRepository,
    private tagFactory: TagFactory,
    private utilsService: UtilsService,
  ) {}

  async getAllTags(): Promise<Tag[]> {
    const tags = await this.tagRepository.getAll();
    return tags;
  }

  async createTag(tag: Omit<Tag, 'id'>): Promise<Tag> {
    const tagCheck = await this.getTagsByNames(tag.tag);

    if (tagCheck.tags.length >= 0) {
      return tagCheck.tags[0];
    }
    const createdTag = await this.tagRepository.save(tag);
    return createdTag;
  }

  async getTagsByNames(tagName: string | string[]): Promise<Tags> {
    if (!Array.isArray(tagName)) {
      tagName = [tagName];
    }
    const tags = await this.tagFindOrCreate(tagName);
    return tags;
  }

  async tagFindOrCreate(tagNames: string[]): Promise<Tags> {
    const findedTags = await this.tagRepository.findByTagNames(tagNames);
    const tags = new Tags(findedTags);
    const notExistTags = tags.findNotExistTagNames(tagNames);

    //리팩토링 대상. 안쓸 객체 만들어서 그냥 보냄.
    const createTags = notExistTags.map((tag) => {
      return this.tagFactory.create(this.utilsService.getUuid(), tag);
    });
    await this.tagRepository.insertBulk(createTags);
    const resultTags = [...findedTags, ...createTags];

    return new Tags(resultTags);
  }

  async attachTag(bookmarkId: string, tags: Tags): Promise<any[]> {
    const attach = await this.tagRepository.attachTag(bookmarkId, tags);
    return attach;
  }

  async detachTag(
    bookmarkId: string,
    tagId: string | string[],
  ): Promise<string> {
    if (!Array.isArray(tagId)) {
      tagId = [tagId];
    }
    await this.tagRepository.detachTag(bookmarkId, tagId);
    return 'Deleted';
  }

  async getTagsByIds(tagId: string | string[]): Promise<Tag[]> {
    if (!Array.isArray(tagId)) {
      tagId = [tagId];
    }
    const tags = await this.tagRepository.getTagsByIds(tagId);
    return tags;
  }

  async getUserAllTags(userId: string): Promise<TagWithCount[]> {
    const tags = await this.tagRepository.getUserAllTags(userId);
    return tags;
  }
}
