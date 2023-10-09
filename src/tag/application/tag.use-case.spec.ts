import { Test } from '@nestjs/testing';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';
import { TagFactory } from '../domain/tag.factory';
import { TagEntity } from '../infra/db/entity/tag.entity';
import { TagRepository } from '../infra/db/repository/tag.repository';
import { TagUseCases } from './tag.use-case';

describe('tag-use-case', () => {
  let tagService: TagUseCases;
  let tagRepository: TagRepository;
  let tagFactory: TagFactory;
  let utilsService: UtilsService;
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
        TagUseCases,
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
    tagService = module.get(TagUseCases);
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
      tagRepository.getAll = jest.fn().mockResolvedValue([]);
      expect(await tagService.getAllTags()).toStrictEqual([]);
    });

    it('태그 배열을 반환한다.', async () => {
      const mockTagObj = {
        id: 'mockId',
        tag: 'MockTagName',
      };
      tagRepository.getAll = jest.fn().mockResolvedValue([mockTagObj]);
      expect(await tagService.getAllTags()).toStrictEqual([mockTagObj]);
    });
  });

  describe('createTag', () => {
    const mockTagObj = {
      tag: 'MockTagName',
    };
    it('이미 등록된 태그가 있으면 등록된 태그를 반환한다', async () => {
      const getTagsByNamesResolve = { ...mockTagObj, id: 'mockId' };
      tagService['getTagsByNames'] = jest
        .fn()
        .mockResolvedValue([getTagsByNamesResolve]);
      expect(await tagService.createTag(mockTagObj)).toStrictEqual(
        getTagsByNamesResolve,
      );
    });

    it('등록되어 있지 않은 태그는 태그를 등록하고 반환한다', async () => {
      const getTagsByNamesResolve = { ...mockTagObj, id: 'mockId' };
      tagService['getTagsByNames'] = jest
        .fn()
        .mockResolvedValue([getTagsByNamesResolve]);
      tagRepository.save = jest.fn().mockResolvedValue(getTagsByNamesResolve);
      expect(await tagService.createTag(mockTagObj)).toStrictEqual(
        getTagsByNamesResolve,
      );
    });
  });

  describe('getTagsByNames', () => {
    it('태그이름 문자열을 인수로 보내면 해당하는 태그를 반환한다.', async () => {
      const mockTagObj = {
        id: 'mockId',
        tag: 'MockTagName',
      };
      tagService['tagFindOrCreate'] = jest.fn().mockResolvedValue([mockTagObj]);
      expect(await tagService.getTagsByNames(mockTagObj.tag)).toStrictEqual([
        mockTagObj,
      ]);
    });

    it('태그이름 배열을 인수로 보내면 해당하는 태그를 반환한다.', async () => {
      const mockTagObjOne = {
        id: 'mockIdOne',
        tag: 'MockTagNameOne',
      };
      const mockTagObjTwo = {
        id: 'mockIdTwo',
        tag: 'MockTagNameTwo',
      };
      tagService['tagFindOrCreate'] = jest
        .fn()
        .mockResolvedValue([mockTagObjOne, mockTagObjTwo]);
      expect(
        await tagService.getTagsByNames([mockTagObjOne.tag, mockTagObjTwo.tag]),
      ).toStrictEqual([mockTagObjOne, mockTagObjTwo]);
    });
  });

  describe('tagFindOrCreate', () => {
    const findByTagNamesResolve = [
      {
        id: 'mockIdOne',
        tag: 'mockTagOne',
      },
      {
        id: 'mockIdTwo',
        tag: 'mockTagTwo',
      },
    ];

    /**
     * tagRepository.create() 메서드가 map으로 작동해서 두번 돌아간다.
     */
    it('태그 이름 배열을 인수로 제공했을 때 전부 저장되지 않은 경우 저장한 결과와 검색된 태그를 배열로 반환한다', async () => {
      tagRepository.findByTagNames = jest.fn().mockResolvedValue([]);
      tagRepository.insertBulk = jest.fn().mockResolvedValue('');

      const result = await tagService['tagFindOrCreate']([
        findByTagNamesResolve[0].tag,
        findByTagNamesResolve[1].tag,
      ]);
      const resultTags = result.map((tag) => {
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
        .mockResolvedValue([findByTagNamesResolve[0]]);
      tagRepository.insertBulk = jest.fn().mockResolvedValue('');
      tagFactory.create = jest.fn().mockReturnValue(findByTagNamesResolve[1]);

      expect(
        await tagService['tagFindOrCreate']([
          findByTagNamesResolve[0].tag,
          findByTagNamesResolve[1].tag,
        ]),
      ).toStrictEqual(findByTagNamesResolve);
    });

    it('태그 이름 배열을 인수로 제공하면 다 저장된 태그인 경우 검색된 태그를 배열로 반환한다', async () => {
      tagRepository.findByTagNames = jest
        .fn()
        .mockResolvedValue(findByTagNamesResolve);
      tagRepository.insertBulk = jest.fn().mockResolvedValue('');
      tagFactory.create = jest.fn().mockReturnValue(findByTagNamesResolve);

      expect(
        await tagService['tagFindOrCreate']([
          findByTagNamesResolve[0].tag,
          findByTagNamesResolve[1].tag,
        ]),
      ).toStrictEqual(findByTagNamesResolve);
    });
  });

  describe('attachTag', () => {
    const attachTagObj = {
      bookmarkId: 'mockBookmarkId',
      tags: [
        {
          id: 'mockIdOne',
          tag: 'MockTagNameOne',
        },
        {
          id: 'mockIdTwo',
          tag: 'MockTagNameTwo',
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
      tagRepository.attachTag = jest.fn().mockResolvedValue(attachTagResolve);
      expect(
        await tagService.attachTag(attachTagObj.bookmarkId, attachTagObj.tags),
      ).toStrictEqual(attachTagResolve);
    });
  });

  describe('detachTag', () => {
    const detachTagObj = {
      bookmarkId: 'mockBookmarkId',
      tagId: 'mockTagIdOne',
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
          'mockTagIdTwo',
        ]),
      ).toBe('Deleted');
    });
  });

  describe('getTagsByIds', () => {
    const mocktagIds = ['mockTagIdOne', 'mockTagIdTwo'];
    const getTagsByIdsResolve = [
      {
        id: mocktagIds[0],
        tag: 'mockTagOne',
      },
      {
        id: mocktagIds[1],
        tag: 'mockTagTwo',
      },
    ];
    it('태그 아이디 문자열을 인수로 제공하면 해당하는 태그 배열을 반환한다.', async () => {
      tagRepository.getTagsByIds = jest
        .fn()
        .mockResolvedValue(getTagsByIdsResolve[0]);

      expect(await tagService.getTagsByIds(mocktagIds[0])).toStrictEqual(
        getTagsByIdsResolve[0],
      );
    });

    it('태그 아이디 배열을 인수로 제공하면 해당하는 태그 배열을 반환한다.', async () => {
      tagRepository.getTagsByIds = jest
        .fn()
        .mockResolvedValue(getTagsByIdsResolve);

      expect(await tagService.getTagsByIds(mocktagIds)).toStrictEqual(
        getTagsByIdsResolve,
      );
    });
  });

  describe('getUserAllTags', () => {
    it('유저 아이디를 인수로 제공하면 작성한 모든 태그를 반환한다', async () => {
      const mockUserId = 'mockUserId';
      const getUserAllTagsResolve = [
        {
          id: 'mockIdOne',
          tag: 'mockTagOne',
          count: 1,
        },
        {
          id: 'mockIdTwo',
          tag: 'mockTagTwo',
          count: 2,
        },
      ];

      tagRepository.getUserAllTags = jest
        .fn()
        .mockResolvedValue(getUserAllTagsResolve);

      expect(await tagService.getUserAllTags(mockUserId)).toStrictEqual(
        getUserAllTagsResolve,
      );
    });
  });

  describe('getNotExistTag', () => {
    const mockInputTags = ['mockTagOne', 'mockTagTwo', 'mockTagThree'];
    const mockExistTags = [
      {
        id: 'mockIdTwo',
        tag: 'mockTagTwo',
      },
    ];
    const mockNotExistTag = ['mockTagOne', 'mockTagThree'];
    it('inputTags중 existTags에 존재하지 않는 태그배열을 반환한다.', () => {
      expect(
        tagService['getNotExistTag'](mockExistTags, mockInputTags),
      ).toStrictEqual(mockNotExistTag);
    });
  });
});
