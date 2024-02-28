import { Inject, Injectable } from '@nestjs/common';
import { TagRepository } from 'src/tag/domain/repository/tag.repository';
import { Tag } from 'src/tag/domain/tag';
import {
  AttachTagId,
  AttachTagIds,
  TagWithCount,
  TagWithCounts,
} from 'src/tag/domain/tag.interface';
import { UtilsService } from 'src/utils/utils.service';
import { TagFactory } from '../domain/tag.factory';
import { Tags } from '../domain/tags';

export abstract class TagUseCase {
  getAllTags: () => Promise<Tags>;
  createTag: (tag: Omit<Tag, 'id'>) => Promise<Tag>;
  getTagsByNames: (tagName: string | string[]) => Promise<Tags>;
  attachTag: (bookmarkId: string, tags: Tags) => Promise<AttachTagIds>;
  detachTag: (bookmarkId: string, tagId: string | string[]) => Promise<string>;
  getTagsByIds: (tagId: string | string[]) => Promise<Tags>;
  getUserAllTags: (userId: string) => Promise<TagWithCounts>;
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
    const tagEntities = await this.tagRepository.getAll();

    return new Tags(
      tagEntities.tags.map((tag) => {
        return new Tag(tag.id, tag.tag);
      }),
    );
  }

  async createTag(tag: Omit<Tag, 'id'>): Promise<Tag> {
    const tagCheck = await this.getTagsByNames(tag.tag);

    if (tagCheck.tags.length >= 0) {
      return tagCheck.tags[0];
    }

    const createdTag = await this.tagRepository.save(tag);

    return new Tag(createdTag.id, createdTag.tag);
  }

  async getTagsByNames(tagName: string | string[]): Promise<Tags> {
    if (!Array.isArray(tagName)) {
      tagName = [tagName];
    }
    const tags = await this.tagFindOrCreate(tagName);
    return tags;
  }

  async tagFindOrCreate(tagNames: string[]): Promise<Tags> {
    const tagEntities = await this.tagRepository.findByTagNames(tagNames);
    const tags = new Tags(
      tagEntities.tags.map((tag) => {
        return new Tag(tag.id, tag.tag);
      }),
    );
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

  async attachTag(bookmarkId: string, tags: Tags): Promise<AttachTagIds> {
    const attach = await this.tagRepository.attachTag(bookmarkId, tags);

    return new AttachTagIds(
      attach.attaches.map((attach) => {
        return new AttachTagId(attach.id, attach.bookmarkId, attach.tagId);
      }),
    );
  }

  async detachTag(
    bookmarkId: string,
    tagId: string | string[],
  ): Promise<string> {
    if (!Array.isArray(tagId)) {
      tagId = [tagId];
    }
    const detached = await this.tagRepository.detachTag(bookmarkId, tagId);
    return 'Deleted';
  }

  async getTagsByIds(tagId: string | string[]): Promise<Tags> {
    if (!Array.isArray(tagId)) {
      tagId = [tagId];
    }
    const tagEntities = await this.tagRepository.getTagsByIds(tagId);
    return new Tags(
      tagEntities.tags.map((tag) => {
        return new Tag(tag.id, tag.tag);
      }),
    );
  }

  async getUserAllTags(userId: string): Promise<TagWithCounts> {
    const tags = await this.tagRepository.getUserAllTags(userId);

    return new TagWithCounts(
      tags.tagWithCounts.map((item) => {
        return new TagWithCount(item.id, item.tag, item.count);
      }),
    );
  }
}
