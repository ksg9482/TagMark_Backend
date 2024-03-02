import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TagRepository } from 'src/tag/domain/repository/tag.repository';
import { Tag } from 'src/tag/domain/tag';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity } from 'src/tag/infra/db/entity/tag.entity';
import { TagFactory } from 'src/tag/domain/tag.factory';
import { TagWithCount } from 'src/tag/domain/tag.interface';
import { UtilsService } from 'src/utils/utils.service';
import { Tags } from 'src/tag/domain/tags';
import { GetDto } from '../dto/get.dto';
import { SaveDto } from '../dto/save.dto';
import { UpdateDto } from '../dto/update.dto';
import { GetAllDto } from '../dto/get-all.dto';
import { DeleteDto } from '../dto/delete.dto';
import { TagWithCountsDto } from '../dto/tag-with-count.dto';
import { AttachTagDto } from '../dto/attach-tag.dto';
import { DetachTagDto } from '../dto/detach-tag.dto';
import { InsertBulkDto } from '../dto/insert-bulk.dto';

@Injectable()
export class TagRepositoryImpl implements TagRepository {
  constructor(
    @InjectRepository(TagEntity)
    private tagRepository: Repository<TagEntity>,
    private tagFactory: TagFactory,
    private utilsService: UtilsService,
  ) {}

  async get(inputId: string): Promise<GetDto | null> {
    const tagEntity = await this.tagRepository.findOne({
      where: { id: inputId },
    });
    if (!tagEntity) {
      return null;
    }
    const { id, tag } = tagEntity;
    return new GetDto(tagEntity);
  }

  createEntity(tag: string): TagEntity {
    return this.tagRepository.create({
      id: this.utilsService.getUuid(),
      tag: tag,
    });
  }

  async save(tag: Omit<Tag, 'id'>): Promise<SaveDto> {
    const tagEntity = this.createEntity(tag.tag);
    await this.tagRepository.save(tagEntity);

    return new SaveDto(tagEntity);
  }

  async update(id: string, item: Tag): Promise<UpdateDto> {
    //트랜잭션을 고려하면 존재 유무 검사부터 업데이트까지 리포지토리에서 커넥트 하나 가지고 쭉 진행한는게 좋지 않을까?
    const tagEntity = this.tagRepository.create(item);

    await this.tagRepository.manager.transaction(
      'REPEATABLE READ',
      async (transactionalEntityManager) => {
        await transactionalEntityManager.update(TagEntity, id, tagEntity);
      },
    );
    return new UpdateDto(tagEntity);
  }

  async getAll(): Promise<GetAllDto> {
    const tagEntities = await this.tagRepository.find();
    return new GetAllDto(tagEntities);
  }

  async findByTagNames(tagNames: string[]): Promise<GetAllDto> {
    if (tagNames.length <= 0) {
      return new GetAllDto([]);
    }

    const tagEntities = await this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.tag IN (:...tags)', { tags: tagNames })
      .getMany();

    return new GetAllDto(tagEntities);
  }

  async getTagsByIds(tagId: string[]): Promise<GetAllDto> {
    if (tagId.length <= 0) {
      return new GetAllDto([]);
    }
    const tagEntities = await this.tagRepository
      .createQueryBuilder()
      .select()
      .whereInIds(tagId)
      .getMany();

    return new GetAllDto(tagEntities);
  }

  async attachTag(bookmarkId: string, tags: Tags): Promise<AttachTagDto> {
    let checkedTags: TagEntity[] = [];
    for (let tag of tags.tags) {
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
        checkedTags.push(
          this.tagRepository.create({ id: tag.id, tag: tag.tag }),
        );
      }

      await this.tagRepository
        .createQueryBuilder()
        .insert()
        .into('bookmark_tag')
        .values({
          id: this.utilsService.getUuid(),
          bookmarkId: bookmarkId,
          tagId: tag.id,
        })
        .execute();
    }

    return new AttachTagDto(
      checkedTags.map((checkedTag) => {
        return {
          id: checkedTag.id,
          bookmarkId: bookmarkId,
          tagId: checkedTag.tag,
        };
      }),
    );
  }

  async detachTag(bookmarkId: string, tagIds: string[]): Promise<DetachTagDto> {
    let checkedTags: TagEntity[] = [];
    for (let tagId of tagIds) {
      const check = await this.tagRepository
        .createQueryBuilder()
        .select('*')
        .from('bookmark_tag', 'bookmark_tag')
        .where(
          'bookmark_tag."bookmarkId" = (:bookmarkId) and bookmark_tag."tagId" = (:tagId)',
          { bookmarkId: bookmarkId, tagId: tagId },
        )
        .getRawOne();

      if (check) {
        checkedTags.push(this.tagRepository.create({ id: tagId }));
      }
    }

    await this.tagRepository
      .createQueryBuilder()
      .delete()
      .from('bookmark_tag', 'bookmark_tag')
      .where(
        `bookmark_tag."bookmarkId" = (:bookmarkId) AND bookmark_tag."tagId" IN (:...tagIds)`,
        { bookmarkId: bookmarkId, tagIds: tagIds },
      )
      .execute();

    return new DetachTagDto(
      checkedTags.map((checkedTag) => {
        return {
          id: checkedTag.id,
          bookmarkId: bookmarkId,
          tagId: checkedTag.tag,
        };
      }),
    );
  }

  async insertBulk(tags: Tags): Promise<InsertBulkDto> {
    const tagEntities = tags.tags.map((tag) => {
      return this.tagRepository.create({ id: tag.id, tag: tag.tag });
    });

    await this.tagRepository
      .createQueryBuilder()
      .insert()
      .into('tag')
      .values(tags.tags)
      .execute();

    return new InsertBulkDto(tagEntities);
  }

  async getUserAllTags(userId: string): Promise<TagWithCountsDto> {
    const tags: TagWithCount[] = await this.tagRepository
      .createQueryBuilder('tag')
      .select(`tag.*, COUNT(bookmark.id)`)
      .leftJoin(`bookmark_tag`, `bookmark_tag`, `bookmark_tag."tagId" = tag.id`)
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

    return new TagWithCountsDto(tags);
  }

  async delete(id: string): Promise<DeleteDto> {
    const tagEntity = this.tagRepository.create({ id: id });
    await this.tagRepository.delete(tagEntity.id);
    return new DeleteDto(tagEntity);
  }
}
