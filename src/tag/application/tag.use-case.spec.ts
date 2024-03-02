import { Test } from '@nestjs/testing';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';
import { TagRepository } from '../domain/repository/tag.repository';
import { Tag } from '../domain/tag';
import { TagFactory } from '../domain/tag.factory';
import {
  AttachTagId,
  AttachTagIds,
  TagWithCount,
  TagWithCounts,
} from '../domain/tag.interface';
import { Tags } from '../domain/tags';
import { AttachTagDto } from '../infra/db/dto/attach-tag.dto';
import { GetAllDto } from '../infra/db/dto/get-all.dto';
import { TagEntity } from '../infra/db/entity/tag.entity';
import { TagUseCase, TagUseCaseImpl } from './tag.use-case';

describe('tag-use-case', () => {
  let tagService: TagUseCase;
  let tagRepository: TagRepository;
  let tagFactory: TagFactory;
  let tagEntityRepository: Repository<TagEntity>;

  const MockGenericRepository = {
    getAll: jest.fn(),
    get: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const MockTagRepository = {
    ...MockGenericRepository,
    attachTag: jest.fn(),
    find: jest.fn(),
    findByTagNames: jest.fn(),
    getUserAllTags: jest.fn(),
    detachTag: jest.fn(),
    getTagsByIds: jest.fn(),
    insertBulk: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: TagUseCase, useClass: TagUseCaseImpl },
        {
          provide: 'TagRepository',
          useValue: MockTagRepository,
        },
        TagFactory,
        UtilsService,
        {
          provide: 'TagEntityRepository',
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();
    tagService = module.get(TagUseCase);
    tagRepository = module.get('TagRepository');
    tagEntityRepository = module.get('TagEntityRepository');
    tagFactory = module.get(TagFactory);
  });

  describe('define', () => {
    it('be defined tagService', () => {
      expect(tagService).toBeDefined();
    });

    it('be defined tagRepository', () => {
      expect(tagRepository).toBeDefined();
    });

    it('be defined tagEntityRepository', () => {
      expect(tagEntityRepository).toBeDefined();
    });

    it('be defined tagFactory', () => {
      expect(tagFactory).toBeDefined();
    });
  });

  describe('getAllTags', () => {
    it('해당하는 태그가 없을 경우 빈 배열을 반환 한다.', async () => {
      tagRepository.getAll = jest.fn().mockResolvedValue(new GetAllDto([]));
      const result = await tagService.getAllTags();
      expect(result.tags).toStrictEqual([]);
    });

    it('태그 배열을 반환한다.', async () => {
      const fakeTagObj = {
        id: 'fakeId',
        tag: 'fakeTagName',
      };
      tagRepository.getAll = jest
        .fn()
        .mockResolvedValue(new GetAllDto([fakeTagObj]));
      const result = await tagService.getAllTags();

      expect(result.tags).toStrictEqual([new Tag('fakeId', 'fakeTagName')]);
    });
  });

  describe('createTag', () => {
    const fakeTagObj = {
      tag: 'fakeTagName',
    };
    it('이미 등록된 태그가 있으면 등록된 태그를 반환한다', async () => {
      const getTagsByNamesResolve = { ...fakeTagObj, id: 'fakeId' };
      tagService['getTagsByNames'] = jest
        .fn()
        .mockResolvedValue(
          new Tags([
            new Tag(getTagsByNamesResolve.id, getTagsByNamesResolve.tag),
          ]),
        );

      const result = await tagService.createTag(fakeTagObj);
      expect(result.tag).toBe('fakeTagName');
    });

    it('등록되어 있지 않은 태그는 태그를 등록하고 반환한다', async () => {
      const getTagsByNamesResolve = { ...fakeTagObj, id: 'fakeId' };
      tagService['getTagsByNames'] = jest
        .fn()
        .mockResolvedValue(
          new Tags([
            new Tag(getTagsByNamesResolve.id, getTagsByNamesResolve.tag),
          ]),
        );
      tagRepository.save = jest.fn().mockResolvedValue(getTagsByNamesResolve);

      const result = await tagService.createTag(fakeTagObj);

      expect(result.tag).toBe('fakeTagName');
    });
  });

  describe('getTagsByNames', () => {
    it('태그이름 문자열을 인수로 보내면 해당하는 태그를 반환한다.', async () => {
      const fakeTagObj = {
        id: 'fakeId',
        tag: 'fakeTagName',
      };

      tagService.tagFindOrCreate = jest
        .fn()
        .mockResolvedValue(new Tags([new Tag(fakeTagObj.id, fakeTagObj.tag)]));

      const result = await tagService.getTagsByNames(fakeTagObj.tag);

      expect(result.tags[0].tag).toBe('fakeTagName');
    });

    it('태그이름 배열을 인수로 보내면 해당하는 태그를 반환한다.', async () => {
      const fakeTagObjOne = {
        id: 'fakeIdOne',
        tag: 'fakeTagNameOne',
      };
      const fakeTagObjTwo = {
        id: 'fakeIdTwo',
        tag: 'fakeTagNameTwo',
      };
      tagService.tagFindOrCreate = jest
        .fn()
        .mockResolvedValue([fakeTagObjOne, fakeTagObjTwo]);
      expect(
        await tagService.getTagsByNames([fakeTagObjOne.tag, fakeTagObjTwo.tag]),
      ).toStrictEqual([fakeTagObjOne, fakeTagObjTwo]);
    });
  });

  describe('tagFindOrCreate', () => {
    const findByTagNamesResolve = [
      {
        id: 'fakeIdOne',
        tag: 'fakeTagOne',
      },
      {
        id: 'fakeIdTwo',
        tag: 'fakeTagTwo',
      },
    ];

    it('태그 이름 배열을 인수로 제공했을 때 전부 저장되지 않은 경우 저장한 결과와 검색된 태그를 배열로 반환한다', async () => {
      tagRepository.findByTagNames = jest.fn().mockResolvedValue(new Tags([]));
      tagRepository.insertBulk = jest.fn().mockResolvedValue('');

      const result = await tagService.tagFindOrCreate([
        findByTagNamesResolve[0].tag,
        findByTagNamesResolve[1].tag,
      ]);
      const resultTags = result.tags.map((tag) => {
        return { tag: tag.tag };
      });
      expect(resultTags).toStrictEqual([
        { tag: findByTagNamesResolve[0].tag },
        { tag: findByTagNamesResolve[1].tag },
      ]);
    });

    it('태그 이름 배열을 인수로 제공하면 저장되지 않은 태그가 있을 경우 저장한 결과와 검색된 태그를 배열로 반환한다', async () => {
      tagRepository.findByTagNames = jest
        .fn()
        .mockResolvedValue(
          new Tags([
            new Tag(findByTagNamesResolve[0].id, findByTagNamesResolve[0].tag),
          ]),
        );
      tagRepository.insertBulk = jest.fn().mockResolvedValue('');
      tagFactory.create = jest.fn().mockReturnValue(findByTagNamesResolve[1]);

      const result = await tagService.tagFindOrCreate([
        findByTagNamesResolve[0].tag,
        findByTagNamesResolve[1].tag,
      ]);

      expect(result.tags[0].tag).toBe('fakeTagOne');
      expect(result.tags[1].tag).toBe('fakeTagTwo');
    });

    it('태그 이름 배열을 인수로 제공하면 다 저장된 태그인 경우 검색된 태그를 배열로 반환한다', async () => {
      tagRepository.findByTagNames = jest.fn().mockResolvedValue(
        new Tags(
          findByTagNamesResolve.map((tag) => {
            return new Tag(tag.id, tag.tag);
          }),
        ),
      );
      tagRepository.insertBulk = jest.fn().mockResolvedValue('');
      tagFactory.create = jest.fn().mockReturnValue(findByTagNamesResolve);

      const result = await tagService.tagFindOrCreate([
        findByTagNamesResolve[0].tag,
        findByTagNamesResolve[1].tag,
      ]);
      expect(result.tags[0].tag).toBe('fakeTagOne');
      expect(result.tags[1].tag).toBe('fakeTagTwo');
    });
  });

  describe('attachTag', () => {
    const attachTagObj = {
      bookmarkId: 'fakeBookmarkId',
      tags: [
        {
          id: 'fakeIdOne',
          tag: 'fakeTagNameOne',
        },
        {
          id: 'fakeIdTwo',
          tag: 'fakeTagNameTwo',
        },
      ],
    };
    it('북마크 아이디와 태그 배열을 인수로 제공하면 릴레이션 테이블의 데이터를 반환한다.', async () => {
      const attachTagResolve = [
        {
          id: 'one',
          bookmarkId: attachTagObj.bookmarkId,
          tagId: attachTagObj.tags[0].id,
        },
        {
          id: 'two',
          bookmarkId: attachTagObj.bookmarkId,
          tagId: attachTagObj.tags[1].id,
        },
      ];

      const fakeTags = new Tags([
        new Tag('fakeIdOne', 'fakeTagNameOne'),
        new Tag('fakeIdTwo', 'fakeTagNameTwo'),
      ]);

      tagRepository.attachTag = jest
        .fn()
        .mockResolvedValue(new AttachTagDto(attachTagResolve));

      const result = await tagService.attachTag(
        attachTagObj.bookmarkId,
        fakeTags,
      );

      expect(result).toStrictEqual(
        new AttachTagIds(
          [
            { id: 'one', bookmarkId: 'fakeBookmarkId', tagId: 'fakeIdOne' },
            { id: 'two', bookmarkId: 'fakeBookmarkId', tagId: 'fakeIdTwo' },
          ].map((item) => {
            return new AttachTagId(item.id, item.bookmarkId, item.tagId);
          }),
        ),
      );
    });
  });

  describe('detachTag', () => {
    const detachTagObj = {
      bookmarkId: 'fakeBookmarkId',
      tagId: 'fakeTagIdOne',
    };

    it('북마크 아이디와 태그 아이디 문자열을 인수로 제공하면 Deleted 문자열을 반환한다.', async () => {
      tagRepository.detachTag = jest.fn().mockResolvedValue('detached');
      expect(
        await tagService.detachTag(detachTagObj.bookmarkId, detachTagObj.tagId),
      ).toBe('Deleted');
    });

    it('북마크 아이디와 태그 아이디 배열을 인수로 제공하면 Deleted 문자열을 반환한다.', async () => {
      tagRepository.detachTag = jest.fn().mockResolvedValue('detached');
      expect(
        await tagService.detachTag(detachTagObj.bookmarkId, [
          detachTagObj.tagId,
          'fakeTagIdTwo',
        ]),
      ).toBe('Deleted');
    });
  });

  describe('getTagsByIds', () => {
    const faketagIds = ['fakeTagIdOne', 'fakeTagIdTwo'];
    const getTagsByIdsResolve = [
      {
        id: faketagIds[0],
        tag: 'fakeTagOne',
      },
      {
        id: faketagIds[1],
        tag: 'fakeTagTwo',
      },
    ];
    it('태그 아이디 문자열을 인수로 제공하면 해당하는 태그 배열을 반환한다.', async () => {
      tagRepository.getTagsByIds = jest
        .fn()
        .mockResolvedValue(new GetAllDto([getTagsByIdsResolve[0]]));

      const result = await tagService.getTagsByIds('fakeTagIdOne');

      expect(result).toStrictEqual(
        new Tags([new Tag('fakeTagIdOne', 'fakeTagOne')]),
      );
    });

    it('태그 아이디 배열을 인수로 제공하면 해당하는 태그 배열을 반환한다.', async () => {
      tagRepository.getTagsByIds = jest
        .fn()
        .mockResolvedValue(new GetAllDto(getTagsByIdsResolve));

      const result = await tagService.getTagsByIds([
        'fakeTagIdOne',
        'fakeTagIdTwo',
      ]);

      expect(result).toStrictEqual(
        new Tags([
          new Tag('fakeTagIdOne', 'fakeTagOne'),
          new Tag('fakeTagIdTwo', 'fakeTagTwo'),
        ]),
      );
    });
  });

  describe('getUserAllTags', () => {
    it('유저 아이디를 인수로 제공하면 작성한 모든 태그를 반환한다', async () => {
      const fakeUserId = 'fakeUserId';
      const getUserAllTagsResolve = [
        {
          id: 'fakeIdOne',
          tag: 'fakeTagOne',
          count: 1,
        },
        {
          id: 'fakeIdTwo',
          tag: 'fakeTagTwo',
          count: 2,
        },
      ];

      tagRepository.getUserAllTags = jest.fn().mockResolvedValue(
        new TagWithCounts(
          getUserAllTagsResolve.map((item) => {
            return new TagWithCount(item.id, item.tag, item.count);
          }),
        ),
      );

      expect(await tagService.getUserAllTags(fakeUserId)).toStrictEqual(
        new TagWithCounts(
          [
            {
              id: 'fakeIdOne',
              tag: 'fakeTagOne',
              count: 1,
            },
            {
              id: 'fakeIdTwo',
              tag: 'fakeTagTwo',
              count: 2,
            },
          ].map((item) => {
            return new TagWithCount(item.id, item.tag, item.count);
          }),
        ),
      );
    });
  });
});
