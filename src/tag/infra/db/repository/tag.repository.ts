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
    return this.tagRepository.create({
      id: this.utilsService.getUuid(),
      tag: tag,
    });
  }

  async save(tag: Omit<Tag, 'id'>): Promise<Tag> {
    //create는 entity 생성, save는 entity를 db에 저장으로 명시.
    //create가 엔티티 생성인지, db에 생성인지 명확하지 않았음. create로 재활용
    const tagEntity = this.createEntity(tag.tag);
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
    tagEntities.tag = item.tag;
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
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      const check = await this.tagRepository
        .createQueryBuilder()
        .select('*')
        .from('bookmark_tag', 'bookmark_tag')
        .where(
          'bookmark_tag."bookmarkId" = (:bookmarkId) and bookmark_tag."tagId" = (:tagId)',
          { bookmarkId: bookmarkId, tagId: tag.id },
        )
        .getRawOne();
      if (check) {
        arr.push(check);
      }

      const attachTag = await this.tagRepository
        .createQueryBuilder()
        .insert()
        .into('bookmark_tag')
        .values({
          id: this.utilsService.getUuid(),
          bookmarkId: bookmarkId,
          tagId: tag.id,
        })
        .execute();

      arr.push(attachTag);
    }
    return arr;
  }

  async detachTag(bookmarkId: string, tagIds: string[]): Promise<any> {
    const deletedTag = await this.tagRepository
      .createQueryBuilder()
      .delete()
      .from('bookmark_tag', 'bookmark_tag')
      .where(
        `bookmark_tag."bookmarkId" = (:bookmarkId) AND bookmark_tag."tagId" IN (:...tagIds)`,
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
        `bookmark_tag`,
        `bookmark_tag`,
        `bookmark_tag."tagId" = tag.id`,
      )
      .innerJoin(
        `bookmark`,
        `bookmark`,
        `bookmark.id = bookmark_tag."bookmarkId"`,
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
