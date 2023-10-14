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
      bookmarkService['bookmarkCheck'] = jest
        .fn()
        .mockResolvedValue(fakeBookmark);

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
      bookmarkService['bookmarkCheck'] = jest.fn().mockResolvedValue(null);
      tagFactory.create = jest.fn().mockReturnValue(fakeTag);
      bookmarkRepository.save = jest.fn().mockResolvedValue(fakeBookmark);

      expect(
        await bookmarkService.createBookmark(
          fakeCreateBookmarkObj.userId,
          fakeCreateBookmarkObj.url,
        ),
      ).toStrictEqual(fakeBookmark);
    });

    it('인수로 tagnames가 제공되었을 경우 tag가 있는 bookmark를 반환한다', async () => {
      const fakeBookmarkWithTag = {
        ...fakeBookmark,
        tags: fakeTag,
      };
      bookmarkService['bookmarkCheck'] = jest.fn().mockResolvedValue(null);
      tagFactory.create = jest.fn().mockReturnValue(fakeTag);
      bookmarkRepository.save = jest
        .fn()
        .mockResolvedValue(fakeBookmarkWithTag);

      expect(
        await bookmarkService.createBookmark(
          fakeCreateBookmarkObj.userId,
          fakeCreateBookmarkObj.url,
          [fakeTag.tag],
        ),
      ).toStrictEqual(fakeBookmarkWithTag);
    });
  });

  describe('syncBookmark', () => {
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

    it('북마크 배열을 반환한다.', async () => {
      bookmarkRepository.syncBookmark = jest
        .fn()
        .mockResolvedValue([fakeBookmark]);
      expect(await bookmarkService.syncBookmark([fakeBookmark])).toStrictEqual([
        fakeBookmark,
      ]);
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
        .mockResolvedValue(fakeBookmark);

      expect(
        await bookmarkService.findBookmark(
          findBookmarkParam.userId,
          findBookmarkParam.bookmarkId,
        ),
      ).toStrictEqual(fakeBookmark);
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

  describe('bookmarkCheck', () => {
    const fakeBookmarkUrl = 'fakeBookmarkUrl';
    const fakeBookmark = {
      id: 'fakeId',
      url: 'fakeUrl',
      userId: 'fakeUserId',
      tags: [],
    };
    it('검색된 북마크가 없을 경우 null을 반환한다', async () => {
      bookmarkRepository.getBookmarkByUrl = jest.fn().mockResolvedValue(null);
      expect(
        await bookmarkService['bookmarkCheck'](fakeBookmarkUrl),
      ).toStrictEqual(null);
    });

    it('검색된 북마크가 없을 경우 null을 반환한다', async () => {
      bookmarkRepository.getBookmarkByUrl = jest
        .fn()
        .mockResolvedValue(fakeBookmark);
      expect(
        await bookmarkService['bookmarkCheck'](fakeBookmarkUrl),
      ).toStrictEqual(fakeBookmark);
    });
  });

  describe('saveBookmarkTag', () => {
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

    it('북마크와 태그를 인수로 제공하면 결과값을 반환한다.', async () => {
      bookmarkRepository.attachbulk = jest
        .fn()
        .mockResolvedValue([
          { bookmarkId: fakeBookmark.id, tagId: fakeTag.id },
        ]);
      expect(
        await bookmarkService['saveBookmarkTag']([fakeBookmark]),
      ).toStrictEqual([{ bookmarkId: fakeBookmark.id, tagId: fakeTag.id }]);
    });
  });

  describe('getBookmarkIdAndTagId', () => {
    const fakeTag = { id: 'mockTagId', tag: 'fakeTag' };
    const fakeBookmark = {
      id: 'fakeBookmarkId',
      url: 'fakeUrl',
      userId: 'fakeUserId',
      tags: [fakeTag],
    };
    it('북마크 아이디와 태그 아이디 배열을 요소로 가진 객체 배열을 반환한다.', async () => {
      expect(
        bookmarkService['getBookmarkIdAndTagId']([fakeBookmark]),
      ).toStrictEqual([{ bookmarkId: fakeBookmark.id, tagIds: [fakeTag.id] }]);
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
    const tempTag = [
      {
        id: '',
        tag: 'fakeTagOne',
      },
      {
        id: '',
        tag: 'fakeTagTwo',
      },
    ];
    const fakeTags = [
      {
        id: 'fakeIdOne',
        tag: 'fakeTagOne',
      },
      {
        id: 'fakeIdTwo',
        tag: 'fakeTagTwo',
      },
    ];
    const tempBookmarks = [
      {
        id: 'fakeBookmarkId',
        url: 'fakeUrl',
        userId: 'fakeUserId',
        tags: tempTag,
      },
    ];
    const tempBookmarksEmptyTag = [
      {
        id: 'fakeBookmarkId',
        url: 'fakeUrl',
        userId: 'fakeUserId',
      },
    ];
    const fakeBookmarks = [
      {
        id: 'fakeBookmarkId',
        url: 'fakeUrl',
        userId: 'fakeUserId',
        tags: fakeTags,
      },
    ];
    const setSyncBookmarkFormInput = {
      userId: 'fakeUserId',
      bookmarks: tempBookmarks,
      tags: [
        {
          id: 'fakeIdOne',
          tag: 'fakeTagOne',
        },
        {
          id: 'fakeIdTwo',
          tag: 'fakeTagTwo',
        },
      ],
    };
    const inputWithEmptyBookmarkTag = {
      userId: 'fakeUserId',
      bookmarks: tempBookmarksEmptyTag,
      tags: [
        {
          id: 'fakeIdOne',
          tag: 'fakeTagOne',
        },
        {
          id: 'fakeIdTwo',
          tag: 'fakeTagTwo',
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
      ).toStrictEqual([...fakeBookmarks]);
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
          id: 'fakeBookmarkId',
          url: 'fakeUrl',
          userId: 'fakeUserId',
          tags: [],
        },
      ]);
    });
  });
});
