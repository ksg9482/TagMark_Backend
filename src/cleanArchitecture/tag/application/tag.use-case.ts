import { Inject } from '@nestjs/common';
import { DataServices } from 'src/core/abstracts';
import { ITagRepository } from 'src/cleanArchitecture/tag/domain/repository/itag.repository';
import { CreateTagDto } from 'src/cleanArchitecture/tag/interface/dto';
import { GetSearchTagsDto } from 'src/controllers/dtos/tag/get-search-tags.dto';
import { Tag } from 'src/cleanArchitecture/tag/domain/tag';
import { Bookmark } from 'src/cleanArchitecture/bookmark/domain/bookmark';
import { Page } from 'src/cleanArchitecture/bookmark/application/bookmark.pagination';
import { TagWithCount } from 'src/cleanArchitecture/tag/domain/tag.interface';

export class TagUseCases {
  constructor(
    // @Inject(DataServices)
    private tagRepository: ITagRepository,
  ) {}

  async getAllTags(): Promise<Tag[]> {
    const tags = await this.tagRepository.getAll();
    
    return tags;
  }

  async createTag(createTagDto: CreateTagDto): Promise<Tag> {
    const tagCheck = await this.getTagsByNames(createTagDto.tag);
    if (tagCheck) {
      return tagCheck[0];
    }

    const createdTag = await this.tagRepository.create(createTagDto.tag);

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
    let tags: Tag[] = await this.tagRepository.findByTagNames(tagNames);

    const tagFilter = this.tagFilter(tags, tagNames);
    if (tagFilter) {
      const createTags = tagFilter.map((tag) => {
        return this.tagRepository.createForm(tag);
      });
      await this.tagRepository.insertBulk(createTags);

      tags = [...tags, ...createTags];
    }

    return tags;
  }

  async attachTag(bookmarkId: string, tags: Tag[]): Promise<any[]> {
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
    const tags: any[] = await this.tagRepository.getUserAllTags(userId);
    const countForm: TagWithCount[] = tags.map((tag) => {
      return { ...tag, count: Number(tag['count']) };
    });
    return countForm;
  }

  

  protected tagFilter(finedTagArr: Tag[], inputTagArr: string[]): string[] {
    const tagArr = finedTagArr.map((tag) => {
      return tag.getTag();
    });
    return inputTagArr.filter((tag) => !tagArr.includes(tag));
  }
}
