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
  const MockbookmarkRepository = {
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
          useValue: MockbookmarkRepository,
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

    it('be defined tagFactory', () => {
      expect(bookmarkFactory).toBeDefined();
    });
  });

  describe('createBookmark', () => {
    const mockCreateBookmarkObj = {
      userId: 'mockUserId',
      url: 'mockUrl',
    };

    //tagNames
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

  describe('deleteBookmark', () => {
    it('', () => {
      console.log();
    });
  });

  describe('editBookmarkUrl', () => {
    it('', () => {
      console.log();
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
    it('', () => {
      console.log();
    });
  });

  describe('getTagAllBookmarksOR', () => {
    it('', () => {
      console.log();
    });
  });

  describe('getUserAllBookmarks', () => {
    it('', () => {
      console.log();
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
    it('', () => {
      console.log();
    });
  });

  describe('getBookmarkIdAndTagId', () => {
    it('', () => {
      console.log();
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
      console.log();
    });
  });

  describe('setSyncBookmarkForm', () => {
    it('', () => {
      console.log();
    });
  });

  describe('syncBookmark', () => {
    it('', () => {
      console.log();
    });
  });
});
