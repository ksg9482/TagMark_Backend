import { ITagRepository } from 'src/tag/domain/repository/itag.repository';
import { Tag } from 'src/tag/domain/tag';
import { TagWithCount } from 'src/tag/domain/tag.interface';
import { TagFactory } from '../domain/tag.factory';

//dto 말고 서비스 레이어에서 이용하는 비즈니스 로직에 맞는 인수로 받아야 한다.
//dto를 그대로 받으면 dto에 컨트롤러와 서비스가 의존하게 되어 연결이 강해진다.
export class TagUseCases {
  constructor(
    private tagRepository: ITagRepository,
    private tagFactory: TagFactory,
  ) {}

  async getAllTags(): Promise<Tag[]> {
    const tags = await this.tagRepository.getAll();
    return tags;
  }

  //결국 저장은 데이터 레이어로 넘어가서 엔티티에 맞춰야 한다.
  //그렇다면 여기서 엔티티를 만들어 넘겨줄게 아니라 엔티티 만들 재료를 넘겨줘야 한다.
  async createTag(tag: string): Promise<Tag> {
    const tagCheck = await this.getTagsByNames(tag);
    if (tagCheck) {
      return tagCheck[0];
    }
    const createdTag = this.tagRepository.save(tag);
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
    const result: Tag[] = [];
    const findedTags = await this.tagRepository.findByTagNames(tagNames);

    const notExistTags = this.getNotExistTag(findedTags, tagNames);
    if (notExistTags) {
      const createTags = notExistTags.map((tag) => {
        const tempUuid = '';
        return this.tagFactory.create(tempUuid, tag);
      });
      await this.tagRepository.insertBulk(createTags);
      const resultTags = [...findedTags, ...createTags];
      result.push(...resultTags);
    }

    return result;
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
    const tags = await this.tagRepository.getUserAllTags(userId);
    // const countForm = tags.map((tag) => {
    //   const id = tag.getId();
    //   const tagName = tag.getTag();
    //   const count = tag.getCount();
    //   return { ...tag, count: Number(tag['count']) };
    // });
    return tags;
  }

  protected getNotExistTag(existTags: Tag[], inputTags: string[]): string[] {
    const tagArr = existTags.map((tag) => {
      return tag.getTag();
    });
    return inputTags.filter((tag) => !tagArr.includes(tag));
  }
}
