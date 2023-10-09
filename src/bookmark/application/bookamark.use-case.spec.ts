import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import { TagFactory } from 'src/tag/domain/tag.factory';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';
import { BookmarkFactory } from '../domain/bookmark.factory';
import { BookmarkEntity } from '../infra/db/entity/bookmark.entity';
import { BookmarkRepository } from '../infra/db/repository/bookmark.repository';
import { BookmarkUseCases } from './bookmark.use-case';

describe('bookmark-use-case', () => {
  let bookmarkService: BookmarkUseCases;
  let bookmarkRepository: BookmarkRepository;
  let bookmarkFactory: BookmarkFactory;
  let tagFactory: TagFactory;
  let utilsService: UtilsService;
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

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BookmarkUseCases,
        {
          provide: 'BookmarkRepository',
          useValue: MockBookmarkRepository,
        },
        BookmarkFactory,
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
    bookmarkService = module.get(BookmarkUseCases);
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
    const mockCreateBookmarkObj = {
      userId: 'mockUserId',
      url: 'mockUrl',
    };

    const mockBookmark = {
      id: 'mockId',
      url: 'mockUrl',
      userId: 'mockUserId',
      tags: [],
    };
    const mockTag = {
      id: 'mockIdOne',
      tag: 'mockTagOne',
    };
    it('북마크가 이미 있는 경우 HttpException을 반환 한다.', async () => {
      bookmarkService['bookmarkCheck'] = jest
        .fn()
        .mockResolvedValue(mockBookmark);

      await expect(async () => {
        await bookmarkService.createBookmark(
          mockCreateBookmarkObj.userId,
          mockCreateBookmarkObj.url,
        );
      }).rejects.toThrowError(
        new HttpException('Bookmark is aleady exist', HttpStatus.BAD_REQUEST),
      );
    });

    it('인수로 tagnames가 제공되지 않았을 경우 tag가 빈 배열인 bookmark를 반환한다', async () => {
      bookmarkService['bookmarkCheck'] = jest.fn().mockResolvedValue(null);
      tagFactory.create = jest.fn().mockReturnValue(mockTag);
      bookmarkRepository.save = jest.fn().mockResolvedValue(mockBookmark);

      expect(
        await bookmarkService.createBookmark(
          mockCreateBookmarkObj.userId,
          mockCreateBookmarkObj.url,
        ),
      ).toStrictEqual(mockBookmark);
    });

    it('인수로 tagnames가 제공되었을 경우 tag가 있는 bookmark를 반환한다', async () => {
      const mockBookmarkWithTag = {
        ...mockBookmark,
        tags: mockTag,
      };
      bookmarkService['bookmarkCheck'] = jest.fn().mockResolvedValue(null);
      tagFactory.create = jest.fn().mockReturnValue(mockTag);
      bookmarkRepository.save = jest
        .fn()
        .mockResolvedValue(mockBookmarkWithTag);

      expect(
        await bookmarkService.createBookmark(
          mockCreateBookmarkObj.userId,
          mockCreateBookmarkObj.url,
          [mockTag.tag],
        ),
      ).toStrictEqual(mockBookmarkWithTag);
    });
  });

  describe('syncBookmark', () => {
    const mockTag = {
      id: 'mockIdOne',
      tag: 'mockTagOne',
    };

    const mockBookmark = {
      id: 'mockId',
      url: 'mockUrl',
      userId: 'mockUserId',
      tags: [mockTag],
    };

    it('북마크 배열을 반환한다.', async () => {
      bookmarkRepository.syncBookmark = jest
        .fn()
        .mockResolvedValue([mockBookmark]);
      expect(await bookmarkService.syncBookmark([mockBookmark])).toStrictEqual([
        mockBookmark,
      ]);
    });
  });

  describe('deleteBookmark', () => {
    const inputParam = {
      userId: 'mockUserId',
      bookmarkId: 'mockBookmarkId',
    };

    const mockTag = {
      id: 'mockIdOne',
      tag: 'mockTagOne',
    };

    const mockBookmark = {
      id: 'mockId',
      url: 'mockUrl',
      userId: 'mockUserId',
      tags: [mockTag],
    };
    it('검색된 북마크를 제거한다.', async () => {
      bookmarkRepository.getUserBookmark = jest
        .fn()
        .mockResolvedValue(mockBookmark);
      bookmarkRepository.delete = jest.fn().mockResolvedValue(mockBookmark.id);
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
      userId: 'mockUserId',
      bookmarkId: 'mockBookmarkId',
      changeUrl: 'mockChangeUrl',
    };

    const mockTag = {
      id: 'mockIdOne',
      tag: 'mockTagOne',
    };

    const mockBookmark = {
      id: 'mockId',
      url: 'mockUrl',
      userId: 'mockUserId',
      tags: [mockTag],
    };
    it('검색된 북마크를 제거한다.', async () => {
      bookmarkRepository.getUserBookmark = jest
        .fn()
        .mockResolvedValue(mockBookmark);

      bookmarkRepository.update = jest.fn().mockResolvedValue(mockBookmark.id);
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
    const mockBookmark = {
      id: 'mockId',
      url: 'mockUrl',
      userId: 'mockUserId',
      tags: [],
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
        .mockResolvedValue(mockBookmark);

      expect(
        await bookmarkService.findBookmark(
          findBookmarkParam.userId,
          findBookmarkParam.bookmarkId,
        ),
      ).toStrictEqual(mockBookmark);
    });
  });

  describe('getTagAllBookmarksAND', () => {
    const inputParam = {
      userId: 'mockUserId',
      tags: ['mockTagOne'],
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

    const mockTag = {
      id: 'mockIdOne',
      tag: 'mockTagOne',
    };

    const mockBookmark = {
      id: 'mockId',
      url: 'mockUrl',
      userId: 'mockUserId',
      tags: [mockTag],
    };

    const mockPagedBookmarks = {
      pageSize: 1,
      totalCount: 1,
      totalPage: 1,
      bookmarks: [mockBookmark],
    };
    it('페이지네이션 된 북마크를 반환한다.', async () => {
      bookmarkRepository.findBookmarkTag_AND = jest
        .fn()
        .mockResolvedValue(mockPagedBookmarks);
      expect(
        await bookmarkService.getTagAllBookmarksAND(
          inputParam.userId,
          inputParam.tags,
          inputParam.page,
        ),
      ).toStrictEqual(mockPagedBookmarks);
    });
  });

  describe('getTagAllBookmarksOR', () => {
    const inputParam = {
      userId: 'mockUserId',
      tags: ['mockTagOne'],
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

    const mockTag = {
      id: 'mockIdOne',
      tag: 'mockTagOne',
    };

    const mockBookmark = {
      id: 'mockId',
      url: 'mockUrl',
      userId: 'mockUserId',
      tags: [mockTag],
    };

    const mockPagedBookmarks = {
      pageSize: 1,
      totalCount: 1,
      totalPage: 1,
      bookmarks: [mockBookmark],
    };
    it('페이지네이션 된 북마크를 반환한다.', async () => {
      bookmarkRepository.findBookmarkTag_OR = jest
        .fn()
        .mockResolvedValue(mockPagedBookmarks);
      expect(
        await bookmarkService.getTagAllBookmarksOR(
          inputParam.userId,
          inputParam.tags,
          inputParam.page,
        ),
      ).toStrictEqual(mockPagedBookmarks);
    });
  });

  describe('getUserAllBookmarks', () => {
    const inputParam = {
      userId: 'mockUserId',
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
      const mockTag = {
        id: 'mockIdOne',
        tag: 'mockTagOne',
      };

      const mockBookmark = {
        id: 'mockId',
        url: 'mockUrl',
        userId: 'mockUserId',
        tags: [mockTag],
      };

      const mockPagedBookmarks = {
        pageSize: 1,
        totalCount: 1,
        totalPage: 1,
        bookmarks: [mockBookmark],
      };
      bookmarkRepository.getUserAllBookmarks = jest
        .fn()
        .mockResolvedValue(mockPagedBookmarks);
      expect(
        await bookmarkService.getUserAllBookmarks(
          inputParam.userId,
          inputParam.page,
        ),
      ).toStrictEqual(mockPagedBookmarks);
    });
  });

  describe('getUserBookmarkCount', () => {
    const mockUserId = 'mockUserId';
    it('유저아이디를 인수로 제공하면 북마크 갯수를 반환한다.', async () => {
      bookmarkRepository.getcount = jest.fn().mockResolvedValue({ count: 1 });
      expect(await bookmarkService.getUserBookmarkCount(mockUserId)).toBe(1);
    });
  });

  describe('bookmarkCheck', () => {
    const mockBookmarkUrl = 'mockBookmarkUrl';
    const mockBookmark = {
      id: 'mockId',
      url: 'mockUrl',
      userId: 'mockUserId',
      tags: [],
    };
    it('검색된 북마크가 없을 경우 null을 반환한다', async () => {
      bookmarkRepository.getBookmarkByUrl = jest.fn().mockResolvedValue(null);
      expect(
        await bookmarkService['bookmarkCheck'](mockBookmarkUrl),
      ).toStrictEqual(null);
    });

    it('검색된 북마크가 없을 경우 null을 반환한다', async () => {
      bookmarkRepository.getBookmarkByUrl = jest
        .fn()
        .mockResolvedValue(mockBookmark);
      expect(
        await bookmarkService['bookmarkCheck'](mockBookmarkUrl),
      ).toStrictEqual(mockBookmark);
    });
  });

  describe('saveBookmarkTag', () => {
    const mockTag = {
      id: 'mockIdOne',
      tag: 'mockTagOne',
    };

    const mockBookmark = {
      id: 'mockId',
      url: 'mockUrl',
      userId: 'mockUserId',
      tags: [mockTag],
    };

    it('북마크와 태그를 인수로 제공하면 결과값을 반환한다.', async () => {
      bookmarkRepository.attachbulk = jest
        .fn()
        .mockResolvedValue([
          { bookmarkId: mockBookmark.id, tagId: mockTag.id },
        ]);
      expect(
        await bookmarkService['saveBookmarkTag']([mockBookmark]),
      ).toStrictEqual([{ bookmarkId: mockBookmark.id, tagId: mockTag.id }]);
    });
  });

  describe('getBookmarkIdAndTagId', () => {
    const mockTag = { id: 'mockTagId', tag: 'mockTag' };
    const mockBookmark = {
      id: 'mockBookmarkId',
      url: 'mockUrl',
      userId: 'mockUserId',
      tags: [mockTag],
    };
    it('북마크 아이디와 태그 아이디 배열을 요소로 가진 객체 배열을 반환한다.', async () => {
      expect(
        bookmarkService['getBookmarkIdAndTagId']([mockBookmark]),
      ).toStrictEqual([{ bookmarkId: mockBookmark.id, tagIds: [mockTag.id] }]);
    });
  });

  describe('getBookmarkTagMap', () => {
    const getBookmarkTagMapParam = [
      {
        bookmarkId: 'mockBookmarkId',
        tagIds: ['mockTagIdOne', 'mockTagIdTwo'],
      },
    ];
    const bookmarkTagArr = [
      {
        bookmarkId: 'mockBookmarkId',
        tagId: 'mockTagIdOne',
      },
      {
        bookmarkId: 'mockBookmarkId',
        tagId: 'mockTagIdTwo',
      },
    ];
    it('tagId와 bookmarkId를 키로 가지는 객체 배열을 반환한다', () => {
      expect(
        bookmarkService['getBookmarkTagMap'](getBookmarkTagMapParam),
      ).toStrictEqual(bookmarkTagArr);
    });
  });

  describe('setSyncBookmarkForm', () => {
    const tempTag = [
      {
        id: '',
        tag: 'mockTagOne',
      },
      {
        id: '',
        tag: 'mockTagTwo',
      },
    ];
    const mockTags = [
      {
        id: 'mockIdOne',
        tag: 'mockTagOne',
      },
      {
        id: 'mockIdTwo',
        tag: 'mockTagTwo',
      },
    ];
    const tempBookmarks = [
      {
        id: 'mockBookmarkId',
        url: 'mockUrl',
        userId: 'mockUserId',
        tags: tempTag,
      },
    ];
    const tempBookmarksEmptyTag = [
      {
        id: 'mockBookmarkId',
        url: 'mockUrl',
        userId: 'mockUserId',
      },
    ];
    const mockBookmarks = [
      {
        id: 'mockBookmarkId',
        url: 'mockUrl',
        userId: 'mockUserId',
        tags: mockTags,
      },
    ];
    const setSyncBookmarkFormInput = {
      userId: 'mockUserId',
      bookmarks: tempBookmarks,
      tags: [
        {
          id: 'mockIdOne',
          tag: 'mockTagOne',
        },
        {
          id: 'mockIdTwo',
          tag: 'mockTagTwo',
        },
      ],
    };
    const inputWithEmptyBookmarkTag = {
      userId: 'mockUserId',
      bookmarks: tempBookmarksEmptyTag,
      tags: [
        {
          id: 'mockIdOne',
          tag: 'mockTagOne',
        },
        {
          id: 'mockIdTwo',
          tag: 'mockTagTwo',
        },
      ],
    };
    it('북마크에 담긴 임시 태그는 tags 파라미터에 담긴 데이터로 교체된다', () => {
      expect(
        bookmarkService.setSyncBookmarkForm(
          setSyncBookmarkFormInput.userId,
          setSyncBookmarkFormInput.bookmarks,
          setSyncBookmarkFormInput.tags,
        ),
      ).toStrictEqual([...mockBookmarks]);
    });

    it('북마크에 담긴 임시 태그가 없으면 빈배열이 반환된다', () => {
      expect(
        bookmarkService.setSyncBookmarkForm(
          inputWithEmptyBookmarkTag.userId,
          inputWithEmptyBookmarkTag.bookmarks,
          inputWithEmptyBookmarkTag.tags,
        ),
      ).toStrictEqual([
        {
          id: 'mockBookmarkId',
          url: 'mockUrl',
          userId: 'mockUserId',
          tags: [],
        },
      ]);
    });
  });
});
