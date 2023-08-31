import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ITagRepository } from 'src/tag/domain/repository/itag.repository';
import { Tag } from 'src/tag/domain/tag';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity } from 'src/tag/infra/db/entity/tag.entity';
import { TagFactory } from 'src/tag/domain/tag.factory';
import { TagWithCount } from 'src/tag/domain/tag.interface';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class TagRepository implements ITagRepository {
  constructor(
    @InjectRepository(TagEntity) 
    private tagRepository: Repository<TagEntity>,
    private tagFactory: TagFactory,
    private utilsService: UtilsService,
  ) {}

  async get(inputId: string): Promise<Tag | null> {
    const tagEntity = await this.tagRepository.findOne({
      where: { id: inputId },
    });
    if (!tagEntity) {
      return null;
    }
    const { id, tag } = tagEntity;
    return this.tagFactory.reconstitute(id, tag);
  }

  createEntity(tag: string): TagEntity {
    return this.tagRepository.create({ id: this.utilsService.getUuid(), tag: tag });
  }

  async save(tag: string): Promise<Tag> {
    //create는 entity 생성, save는 entity를 db에 저장으로 명시.
    //create가 엔티티 생성인지, db에 생성인지 명확하지 않았음. create로 재활용
    const tagEntity = this.createEntity(tag);
    await this.tagRepository.save(tagEntity);
    return this.tagFactory.reconstitute(tagEntity.id, tagEntity.tag);
  }

  async update(id: string, item: Tag): Promise<any> {
    //불러와서 확인하고 프로세스 들어가는게 안전할듯.
    const tagEntities = await this.tagRepository
      .createQueryBuilder()
      .select()
      .whereInIds(id)
      .getOne();
    if (tagEntities === null) {
      return null;
    }
    tagEntities.id = id;
    tagEntities.tag = item.getTag();
    return await this.tagRepository.update(id, tagEntities);
  }

  async getAll(): Promise<Tag[]> {
    const tagEntities = await this.tagRepository.find();
    if (tagEntities.length <= 0) {
      return [];
    }
    return tagEntities.map((entity) => {
      return this.tagFactory.reconstitute(entity.id, entity.tag);
    });
  }

  async findByTagNames(tagNames: string[]): Promise<Tag[]> {
    const tagEntities = await this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.tag IN (:...tags)', { tags: tagNames })
      .getMany();

    return tagEntities.map((entity) => {
      return this.tagFactory.reconstitute(entity.id, entity.tag);
    });
  }
  async getTagsByIds(tagId: string[]): Promise<Tag[]> {
    const tagEntities = await this.tagRepository
      .createQueryBuilder()
      .select()
      .whereInIds(tagId)
      .getMany();

    return tagEntities.map((entity) => {
      return this.tagFactory.reconstitute(entity.id, entity.tag);
    });
  }

  async attachTag(bookmarkId: string, tags: Tag[]): Promise<any[]> {
    const arr: any[] = [];
    tags.forEach(async (tag) => {
      const check = await this.tagRepository
        .createQueryBuilder()
        .from('bookmarks_tags', 'bookmarks_tags')
        .where(
          'bookmarks_tags."bookmarkId" = (:bookmarkId) and bookmarks_tags."tagId" = (:tagId)',
          { bookmarkId: bookmarkId, tagId: tag.getId() },
        )
        .getRawOne();

      if (check) {
        arr.push(check);
        return;
      }

      const attachTag = await this.tagRepository
        .createQueryBuilder()
        .insert()
        .into('bookmarks_tags')
        .values({ bookmarkId: bookmarkId, tagId: tag.getId() })
        .execute();

      arr.push(attachTag);
    });

    return arr;
  }

  async detachTag(bookmarkId: string, tagIds: string[]): Promise<any> {
    const deletedTag = await this.tagRepository
      .createQueryBuilder()
      .delete()
      .from('bookmarks_tags', 'bookmarks_tags')
      .where(
        `bookmarks_tags."bookmarkId" = (:bookmarkId) AND bookmarks_tags."tagId" IN (:...tagIds)`,
        { bookmarkId: bookmarkId, tagIds: tagIds },
      )
      .execute();

    return deletedTag;
  }

  async insertBulk(tags: Tag[]): Promise<any> {
    const tagInsertBultk = await this.tagRepository
      .createQueryBuilder()
      .insert()
      .into('tag')
      .values(tags)
      .execute();

    return tagInsertBultk;
  }

  async getUserAllTags(userId: string): Promise<TagWithCount[]> {
    const tags: TagWithCount[] = await this.tagRepository
      .createQueryBuilder('tag')
      .select(`tag.*, COUNT(bookmark.id)`)
      .leftJoin(
        `bookmarks_tags`,
        `bookmarks_tags`,
        `bookmarks_tags."tagId" = tag.id`,
      )
      .innerJoin(
        `bookmark`,
        `bookmark`,
        `bookmark.id = bookmarks_tags."bookmarkId"`,
      )
      .where(`bookmark."userId" = (:userId) OR bookmark."userId" IS NULL`, {
        userId: userId,
      })
      .groupBy('tag.id')
      .orderBy('count', 'DESC')
      .getRawMany();

    return tags;
  }

  async delete(id: string): Promise<any> {
    const userEntity = await this.tagRepository.delete(id);
    return userEntity;
  }
}
