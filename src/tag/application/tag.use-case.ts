import { Inject, Injectable } from '@nestjs/common';
import { TagRepository } from 'src/tag/domain/repository/tag.repository';
import { Tag } from 'src/tag/domain/tag';
import { TagWithCount } from 'src/tag/domain/tag.interface';
import { UtilsService } from 'src/utils/utils.service';
import { TagFactory } from '../domain/tag.factory';
import { Tags } from '../domain/tags';

export abstract class TagUseCase {
  getAllTags: () => Promise<Tags>;
  createTag: (tag: Omit<Tag, 'id'>) => Promise<Tag>;
  getTagsByNames: (tagName: string | string[]) => Promise<Tags>;
  attachTag: (bookmarkId: string, tags: Tags) => Promise<any[]>;
  detachTag: (bookmarkId: string, tagId: string | string[]) => Promise<string>;
  getTagsByIds: (tagId: string | string[]) => Promise<Tags>;
  getUserAllTags: (userId: string) => Promise<TagWithCount[]>;
  tagFindOrCreate: (tagNames: string[]) => Promise<Tags>;
}

@Injectable()
export class TagUseCaseImpl implements TagUseCase {
  constructor(
    @Inject('TagRepository')
    private tagRepository: TagRepository,
    private tagFactory: TagFactory,
    private utilsService: UtilsService,
  ) {}

  async getAllTags(): Promise<Tags> {
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
    const tags = await this.tagRepository.findByTagNames(tagNames);
    const notExistTags = tags.findNotExistTagNames(tagNames);

    //리팩토링 대상. 안쓸 객체 만들어서 그냥 보냄.
    const createTags = new Tags(
      notExistTags.map((tag) => {
        return new Tag(this.utilsService.getUuid(), tag);
      }),
    );

    await this.tagRepository.insertBulk(createTags);
    tags.mergeTags(createTags);
    return tags;
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

  async getTagsByIds(tagId: string | string[]): Promise<Tags> {
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
