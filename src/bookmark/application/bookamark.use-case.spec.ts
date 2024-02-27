import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import { TagUseCase, TagUseCaseImpl } from 'src/tag/application/tag.use-case';
import { Tag } from 'src/tag/domain/tag';
import { TagFactory } from 'src/tag/domain/tag.factory';
import { Tags } from 'src/tag/domain/tags';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';
import { Bookmark } from '../domain/bookmark';
import { BookmarkFactory } from '../domain/bookmark.factory';
import { Bookmarks } from '../domain/bookmarks';
import { BookmarkRepository } from '../domain/repository/bookmark.repository';
import { GetAllDto } from '../infra/db/dto/get-all.dto';
import { GetDto } from '../infra/db/dto/get.dto';
import { BookmarkEntity } from '../infra/db/entity/bookmark.entity';
import { BookmarkRepositoryImpl } from '../infra/db/repository/bookmark.repository';
import { BookmarkUseCase, BookmarkUseCaseImpl } from './bookmark.use-case';

describe('bookmark-use-case', () => {
  let bookmarkService: BookmarkUseCase;
  let bookmarkRepository: BookmarkRepository;
  let bookmarkFactory: BookmarkFactory;
  let tagFactory: TagFactory;
  let tagService: TagUseCase;
  let bookmarkEntityRepository: Repository<BookmarkEntity>;

  const MockGenericRepository = {
    getAll: jest.fn(),
    get: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const MockBookmarkRepository = {
    ...MockGenericRepository,
    getUserBookmark: jest.fn(),
    getBookmarkByUrl: jest.fn(),
    getUserAllBookmarks: jest.fn(),
    findBookmarkTag_OR: jest.fn(),
    findBookmarkTag_AND: jest.fn(),
    getcount: jest.fn(),
    syncBookmark: jest.fn(),
    attachbulk: jest.fn(),
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
        { provide: BookmarkUseCase, useClass: BookmarkUseCaseImpl },

        {
          provide: 'BookmarkRepository',
          useValue: MockBookmarkRepository,
        },
        {
          provide: 'TagRepository',
          useValue: MockTagRepository,
        },
        BookmarkFactory,
        {
          provide: TagUseCase,
          useClass: TagUseCaseImpl,
        },
        TagFactory,
        UtilsService,
        AuthModule,
        {
          provide: 'BookmarkEntityRepository',
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();
    bookmarkService = module.get(BookmarkUseCase);
    tagService = module.get(TagUseCase);
    bookmarkRepository = module.get('BookmarkRepository');
    bookmarkEntityRepository = module.get('BookmarkEntityRepository');
    bookmarkFactory = module.get(BookmarkFactory);
    tagFactory = module.get(TagFactory);
  });

  describe('define', () => {
    it('be defined bookmarkService', () => {
      expect(bookmarkService).toBeDefined();
    });

    it('be defined bookmarkRepository', () => {
      expect(bookmarkRepository).toBeDefined();
    });

    it('be defined bookmarkEntityRepository', () => {
      expect(bookmarkEntityRepository).toBeDefined();
    });

    it('be defined bookmarkFactory', () => {
      expect(bookmarkFactory).toBeDefined();
    });
  });

  describe('createBookmark', () => {
    const fakeCreateBookmarkObj = {
      userId: 'fakeUserId',
      url: 'fakeUrl',
    };

    const fakeBookmark = {
      id: 'fakeId',
      url: 'fakeUrl',
      userId: 'fakeUserId',
      tags: [],
    };
    const fakeTag = {
      id: 'fakeIdOne',
      tag: 'fakeTagOne',
    };
    it('북마크가 이미 있는 경우 HttpException을 반환 한다.', async () => {
      // bookmarkService['bookmarkCheck'] = jest
      //   .fn()
      //   .mockResolvedValue(fakeBookmark);

      await expect(async () => {
        await bookmarkService.createBookmark(
          fakeCreateBookmarkObj.userId,
          fakeCreateBookmarkObj.url,
        );
      }).rejects.toThrowError(
        new HttpException('Bookmark is aleady exist', HttpStatus.BAD_REQUEST),
      );
    });

    it('인수로 tagnames가 제공되지 않았을 경우 tag가 빈 배열인 bookmark를 반환한다', async () => {
      bookmarkRepository.getBookmarkByUrl = jest.fn().mockResolvedValue(null);
      tagFactory.create = jest.fn().mockReturnValue(fakeTag);
      bookmarkRepository.save = jest.fn().mockResolvedValue(fakeBookmark);

      const result = await bookmarkService.createBookmark(
        fakeCreateBookmarkObj.userId,
        fakeCreateBookmarkObj.url,
      );
      expect(result).toStrictEqual(
        new Bookmark('fakeId', 'fakeUrl', 'fakeUserId', new Tags([])),
      );
    });

    it('인수로 tagnames가 제공되었을 경우 tag가 있는 bookmark를 반환한다', async () => {
      const fakeBookmarkWithTag = {
        ...fakeBookmark,
        tags: new Tags([new Tag(fakeTag.id, fakeTag.tag)]),
      };
      bookmarkRepository.getBookmarkByUrl = jest.fn().mockResolvedValue(null);
      bookmarkRepository.save = jest
        .fn()
        .mockResolvedValue(fakeBookmarkWithTag);
      tagService.getTagsByNames = jest
        .fn()
        .mockResolvedValue(new Tags([new Tag(fakeTag.id, fakeTag.tag)]));
      tagService.attachTag = jest.fn().mockResolvedValue([{ id: 1 }]);

      const result = await bookmarkService.createBookmark(
        fakeCreateBookmarkObj.userId,
        fakeCreateBookmarkObj.url,
        [fakeTag.tag],
      );

      expect(result).toStrictEqual(
        new Bookmark(
          'fakeId',
          'fakeUrl',
          'fakeUserId',
          new Tags([new Tag(fakeTag.id, fakeTag.tag)]),
        ),
      );
    });
  });

  describe('syncBookmark', () => {
    const fakeTag = new Tag('fakeIdOne', 'fakeTagOne');
    const fakeTags = new Tags([fakeTag]);
    const fakeBookmark = new Bookmark(
      'fakeId',
      'fakeUserId',
      'fakeUrl',
      fakeTags,
    );
    it('북마크 배열을 반환한다.', async () => {
      bookmarkRepository.syncBookmark = jest.fn().mockResolvedValue(
        new GetAllDto([
          {
            id: 'fakeId',
            userId: 'fakeUserId',
            url: 'fakeUrl',
            tags: [
              {
                id: 'fakeIdOne',
                tag: 'fakeTagOne',
              },
            ],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        ]),
      );

      const result = await bookmarkService.syncBookmark(
        new Bookmarks([fakeBookmark]),
      );
      expect(result.bookmarks[0].id).toBe('fakeId');
      expect(result.bookmarks[0].userId).toBe('fakeUserId');
      expect(result.bookmarks[0].url).toBe('fakeUrl');
      expect(result.bookmarks[0].tags[0].id).toBe('fakeIdOne');
      expect(result.bookmarks[0].tags[0].tag).toBe('fakeTagOne');
    });
  });

  describe('deleteBookmark', () => {
    const inputParam = {
      userId: 'fakeUserId',
      bookmarkId: 'fakeBookmarkId',
    };

    const fakeTag = {
      id: 'fakeIdOne',
      tag: 'fakeTagOne',
    };

    const fakeBookmark = {
      id: 'fakeId',
      url: 'fakeUrl',
      userId: 'fakeUserId',
      tags: [fakeTag],
    };
    it('검색된 북마크를 제거한다.', async () => {
      bookmarkRepository.getUserBookmark = jest
        .fn()
        .mockResolvedValue(fakeBookmark);
      bookmarkRepository.delete = jest.fn().mockResolvedValue(fakeBookmark.id);
      expect(
        await bookmarkService.deleteBookmark(
          inputParam.userId,
          inputParam.bookmarkId,
        ),
      ).toStrictEqual({ message: 'Deleted' });
    });
  });

  describe('editBookmarkUrl', () => {
    const inputParam = {
      userId: 'fakeUserId',
      bookmarkId: 'fakeBookmarkId',
      changeUrl: 'fakeChangeUrl',
    };

    const fakeTag = new Tag('fakeIdOne', 'fakeTagOne');
    const fakeTags = new Tags([fakeTag]);
    const fakeBookmark = Bookmark.from(
      'fakeId',
      'fakeUserId',
      'fakeUrl',
      fakeTags,
    );

    it('검색된 북마크를 제거한다.', async () => {
      bookmarkRepository.getUserBookmark = jest
        .fn()
        .mockResolvedValue(fakeBookmark);

      bookmarkRepository.update = jest.fn().mockResolvedValue(fakeBookmark.id);
      expect(
        await bookmarkService.editBookmarkUrl(
          inputParam.userId,
          inputParam.bookmarkId,
          inputParam.changeUrl,
        ),
      ).toStrictEqual({ message: 'Updated' });
    });
  });

  describe('findBookmark', () => {
    const findBookmarkParam = {
      userId: '',
      bookmarkId: '',
    };
    const fakeBookmark = {
      id: 'fakeId',
      url: 'fakeUrl',
      userId: 'fakeUserId',
      tags: [],
      createdAt: new Date('20024-01-01'),
      updatedAt: new Date('20024-01-01'),
    };

    it('검색된 북마크가 없으면 HttpException를 반환한다.', async () => {
      bookmarkRepository.getUserBookmark = jest.fn().mockResolvedValue(null);

      await expect(async () => {
        await bookmarkService.findBookmark(
          findBookmarkParam.userId,
          findBookmarkParam.bookmarkId,
        );
      }).rejects.toThrowError(
        new HttpException('Bookmark not found', HttpStatus.BAD_REQUEST),
      );
    });

    it('검색된 북마크를 반환한다.', async () => {
      bookmarkRepository.getUserBookmark = jest
        .fn()
        .mockResolvedValue(new GetDto(fakeBookmark));

      expect(
        await bookmarkService.findBookmark(
          findBookmarkParam.userId,
          findBookmarkParam.bookmarkId,
        ),
      ).toStrictEqual(
        new Bookmark(
          fakeBookmark.id,
          fakeBookmark.userId,
          fakeBookmark.url,
          new Tags(fakeBookmark.tags),
        ),
      );
    });
  });

  describe('getTagAllBookmarksAND', () => {
    const inputParam = {
      userId: 'fakeUserId',
      tags: ['fakeTagOne'],
      page: {
        pageNo: 1,
        pageSize: 20,
        getLimit: () => {
          return 20;
        },
        getOffset: () => {
          return 0;
        },
      },
    };

    const fakeTag = {
      id: 'fakeIdOne',
      tag: 'fakeTagOne',
    };

    const fakeBookmark = {
      id: 'fakeId',
      url: 'fakeUrl',
      userId: 'fakeUserId',
      tags: [fakeTag],
    };

    const fakePagedBookmarks = {
      pageSize: 1,
      totalCount: 1,
      totalPage: 1,
      bookmarks: [fakeBookmark],
    };
    it('페이지네이션 된 북마크를 반환한다.', async () => {
      bookmarkRepository.findBookmarkTag_AND = jest
        .fn()
        .mockResolvedValue(fakePagedBookmarks);
      expect(
        await bookmarkService.getTagAllBookmarksAND(
          inputParam.userId,
          inputParam.tags,
          inputParam.page,
        ),
      ).toStrictEqual(fakePagedBookmarks);
    });
  });

  describe('getTagAllBookmarksOR', () => {
    const inputParam = {
      userId: 'fakeUserId',
      tags: ['fakeTagOne'],
      page: {
        pageNo: 1,
        pageSize: 20,
        getLimit: () => {
          return 20;
        },
        getOffset: () => {
          return 0;
        },
      },
    };

    const fakeTag = {
      id: 'fakeIdOne',
      tag: 'fakeTagOne',
    };

    const fakeBookmark = {
      id: 'fakeId',
      url: 'fakeUrl',
      userId: 'fakeUserId',
      tags: [fakeTag],
    };

    const fakePagedBookmarks = {
      pageSize: 1,
      totalCount: 1,
      totalPage: 1,
      bookmarks: [fakeBookmark],
    };
    it('페이지네이션 된 북마크를 반환한다.', async () => {
      bookmarkRepository.findBookmarkTag_OR = jest
        .fn()
        .mockResolvedValue(fakePagedBookmarks);
      expect(
        await bookmarkService.getTagAllBookmarksOR(
          inputParam.userId,
          inputParam.tags,
          inputParam.page,
        ),
      ).toStrictEqual(fakePagedBookmarks);
    });
  });

  describe('getUserAllBookmarks', () => {
    const inputParam = {
      userId: 'fakeUserId',
      page: {
        pageNo: 1,
        pageSize: 20,
        getLimit: () => {
          return 20;
        },
        getOffset: () => {
          return 0;
        },
      },
    };
    it('페이지네이션 된 북마크를 반환한다.', async () => {
      const fakeTag = {
        id: 'fakeIdOne',
        tag: 'fakeTagOne',
      };

      const fakeBookmark = {
        id: 'fakeId',
        url: 'fakeUrl',
        userId: 'fakeUserId',
        tags: [fakeTag],
      };

      const fakePagedBookmarks = {
        pageSize: 1,
        totalCount: 1,
        totalPage: 1,
        bookmarks: [fakeBookmark],
      };
      bookmarkRepository.getUserAllBookmarks = jest
        .fn()
        .mockResolvedValue(fakePagedBookmarks);
      expect(
        await bookmarkService.getUserAllBookmarks(
          inputParam.userId,
          inputParam.page,
        ),
      ).toStrictEqual(fakePagedBookmarks);
    });
  });

  describe('getUserBookmarkCount', () => {
    const fakeUserId = 'fakeUserId';
    it('유저아이디를 인수로 제공하면 북마크 갯수를 반환한다.', async () => {
      bookmarkRepository.getcount = jest.fn().mockResolvedValue({ count: 1 });
      expect(await bookmarkService.getUserBookmarkCount(fakeUserId)).toBe(1);
    });
  });

  describe('saveBookmarkTag', () => {
    const fakeTag = new Tag('fakeIdOne', 'fakeTagOne');
    const fakeTags = new Tags([fakeTag]);
    const fakeBookmark = new Bookmark(
      'fakeId',
      'fakeUserId',
      'fakeUrl',
      fakeTags,
    );
    it('북마크와 태그를 인수로 제공하면 결과값을 반환한다.', async () => {
      bookmarkRepository.attachbulk = jest
        .fn()
        .mockResolvedValue([
          { bookmarkId: fakeBookmark.id, tagId: fakeTag.id },
        ]);
      expect(
        await bookmarkService['saveBookmarkTag'](new Bookmarks([fakeBookmark])),
      ).toStrictEqual([{ bookmarkId: fakeBookmark.id, tagId: fakeTag.id }]);
    });
  });

  describe('getBookmarkIdAndTagId', () => {
    const fakeTags = { id: 'mockTagId', tag: 'fakeTag' };
    const fakeTagsInstance = new Tags([new Tag(fakeTags.id, fakeTags.tag)]);

    const fakeBookmark = Bookmark.from(
      'fakeBookmarkId',
      'fakeUserId',
      'fakeUrl',
      fakeTagsInstance,
    );

    it('북마크 아이디와 태그 아이디 배열을 요소로 가진 객체 배열을 반환한다.', async () => {
      const result = bookmarkService['getBookmarkIdAndTagId'](
        new Bookmarks([fakeBookmark]),
      );

      expect(result).toStrictEqual([
        { bookmarkId: fakeBookmark.id, tagIds: [fakeTags.id] },
      ]);
    });
  });

  describe('getBookmarkTagMap', () => {
    const getBookmarkTagMapParam = [
      {
        bookmarkId: 'fakeBookmarkId',
        tagIds: ['fakeTagIdOne', 'fakeTagIdTwo'],
      },
    ];
    const bookmarkTagArr = [
      {
        bookmarkId: 'fakeBookmarkId',
        tagId: 'fakeTagIdOne',
      },
      {
        bookmarkId: 'fakeBookmarkId',
        tagId: 'fakeTagIdTwo',
      },
    ];
    it('tagId와 bookmarkId를 키로 가지는 객체 배열을 반환한다', () => {
      expect(
        bookmarkService['getBookmarkTagMap'](getBookmarkTagMapParam),
      ).toStrictEqual(bookmarkTagArr);
    });
  });

  describe('setSyncBookmarkForm', () => {
    const tempTag = new Tags([
      new Tag('', 'fakeTagOne'),
      new Tag('', 'fakeTagTwo'),
    ]);
    const tempBookmarks = [
      Bookmark.from('fakeBookmarkId', 'fakeUserId', 'fakeUrl', tempTag),
    ];

    const tempBookmarksEmptyTag = [
      Bookmark.from('fakeBookmarkId', 'fakeUserId', 'fakeUrl'),
    ];

    const fakeTagOne = new Tag('fakeIdOne', 'fakeTagOne');
    const fakeTagTwo = new Tag('fakeIdTwo', 'fakeTagTwo');
    const fakeTags = new Tags([fakeTagOne, fakeTagTwo]);
    const fakeBookmarks = [
      new Bookmark('fakeBookmarkId', 'fakeUserId', 'fakeUrl', fakeTags),
    ];

    const setSyncBookmarkFormInput = {
      userId: 'fakeUserId',
      bookmarks: tempBookmarks,
      tags: new Tags([
        new Tag('fakeIdOne', 'fakeTagOne'),
        new Tag('fakeIdTwo', 'fakeTagTwo'),
      ]),
    };
    const inputWithEmptyBookmarkTag = {
      userId: 'fakeUserId',
      bookmarks: tempBookmarksEmptyTag,
      tags: new Tags([]),
    };

    it('북마크에 담긴 임시 태그는 tags 파라미터에 담긴 데이터로 교체된다', () => {
      const result = bookmarkService.setSyncBookmarkForm(
        setSyncBookmarkFormInput.userId,
        setSyncBookmarkFormInput.bookmarks,
        setSyncBookmarkFormInput.tags,
      );

      /**
       * const fakeBookmarks = [
      new Bookmark('fakeBookmarkId', 'fakeUserId', 'fakeUrl', fakeTags),
    ];
       */
      const fakeTagOne = new Tag('fakeIdOne', 'fakeTagOne');
      const fakeTagTwo = new Tag('fakeIdTwo', 'fakeTagTwo');
      const fakeTags = new Tags([fakeTagOne, fakeTagTwo]);
      expect(result[0].id).toBe('fakeBookmarkId');
      expect(result[0].userId).toBe('fakeUserId');
      expect(result[0].url).toBe('fakeUrl');
      expect(result[0].tags[0].id).toBe('fakeIdOne');
      expect(result[0].tags[0].tag).toBe('fakeTagOne');
      expect(result[0].tags[1].id).toBe('fakeIdTwo');
      expect(result[0].tags[1].tag).toBe('fakeTagTwo');
    });

    it('북마크에 담긴 임시 태그가 없으면 빈배열이 반환된다', () => {
      const result = bookmarkService.setSyncBookmarkForm(
        inputWithEmptyBookmarkTag.userId,
        inputWithEmptyBookmarkTag.bookmarks,
        inputWithEmptyBookmarkTag.tags,
      );

      const fakeTagOne = new Tag('fakeIdOne', 'fakeTagOne');
      const fakeTagTwo = new Tag('fakeIdTwo', 'fakeTagTwo');
      const fakeTags = new Tags([fakeTagOne, fakeTagTwo]);
      expect(result[0].id).toBe('fakeBookmarkId');
      expect(result[0].userId).toBe('fakeUserId');
      expect(result[0].url).toBe('fakeUrl');
      expect(result[0].tags).toStrictEqual([]);
    });
  });
});
