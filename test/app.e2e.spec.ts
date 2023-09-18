import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository, DataSource } from 'typeorm';
// import { User } from 'src/frameworks/data-services/postgresql/model';
import { UserEntity } from 'src/user/infra/db/entity/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<UserEntity>;
  const config: ConfigService = new ConfigService();
  const connectDB: DataSource = new DataSource({
    type: 'postgres',
    host: config.get('DB_HOST'),
    port: Number(config.get('DB_PORT')),
    username: config.get('DB_USERNAME'),
    password: config.get('DB_PASSWORD'),
    database: config.get('DB_NAME'),
    entities: [__dirname + '../**/*.entity{.ts,.js}'],
  });
  let accessToken: string;
  let refreshToken: string;

  const baseTest = () => request(app.getHttpServer());
  const privateTest = () => {
    return {
      get: (url: string, accessToken?: string) => {
        return accessToken
          ? baseTest().get(url).set('authorization', `Bearer ${accessToken}`)
          : baseTest().get(url);
      },
      post: (url: string, accessToken?: string) => {
        return accessToken
          ? baseTest().post(url).set('authorization', `Bearer ${accessToken}`)
          : baseTest().post(url);
      },
      patch: (url: string, accessToken: string) => {
        return baseTest()
          .patch(url)
          .set('authorization', `Bearer ${accessToken}`);
      },
      delete: (url: string, accessToken: string) => {
        return baseTest()
          .delete(url)
          .set('authorization', `Bearer ${accessToken}`);
      },
    };
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    usersRepository = moduleFixture.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    await connectDB.initialize();
    await app.init();
  });

  const userParamsOne = { email: 'test1@test.com', password: '123456' };
  const userParamsTwo = { email: 'test2@test.com', password: '123456' };
  const userParamsThree = { email: 'test3@test.com', password: '123456' };
  const userResponseDataOne = {
    success: true,
    createdUser: {
      id: '42ee904c778d1efebe40c0768d766082',
      email: 'test1@test.com',
      nickname: '익명',
      role: 'USER',
      type: 'BASIC',
    },
  };

  describe('user e2e', () => {
    describe('/ (post)', () => {
      it('정상적인 데이터를 전송하면 회원가입한다.', async () => {
        const result = await privateTest()
          .post('/api/user')
          .send(userParamsOne);

        userResponseDataOne.createdUser.id = result.body.createdUser.id;
        expect(result.status).toBe(201);
        expect(result.body.success).toBe(true);
        expect(result.body.createdUser['email']).toBe(
          userResponseDataOne.createdUser['email'],
        );
      });
    });

    describe('/ (post)', () => {
      it('이미 가입한 이메일은 다시 가입할 수 없다.', async () => {
        const result = await privateTest()
          .post('/api/user')
          .send(userParamsOne);
        expect(result.status).toBe(400);
        expect(result.body.success).toBe(false);
        expect(result.body.message).toBe('Email Already exists.');
      });
    });

    describe('/login (post)', () => {
      it('정상적인 데이터를 전송하면 로그인한다', async () => {
        const result = await privateTest()
          .post('/api/user/login')
          .send(userParamsOne);

        expect(result.status).toBe(201);
        expect(result.body.success).toBe(true);
        expect(typeof result.body.accessToken === 'string').toBeTruthy();
        expect(result.body.user['email']).toBe(
          userResponseDataOne.createdUser['email'],
        );

        accessToken = result.body.accessToken;
        refreshToken = decodeURIComponent(
          result.header['set-cookie'][0].split(';')[0],
        );
      });
    });

    describe('/ (get)', () => {
      it('로그인한 유저의 정보를 반환한다', async () => {
        const keys = ['id', 'email', 'nickname', 'role', 'type'];
        const result = await privateTest().get('/api/user', accessToken);

        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
        expect(result.body.user['email']).toBe(
          userResponseDataOne.createdUser['email'],
        );
      });
    });

    describe('/ (patch)', () => {
      it('정상적인 데이터를 전송하면 유저정보가 변경된다', async () => {
        const changeParams = { nickname: 'new-nickname' };
        const result = await privateTest()
          .patch('/api/user', accessToken)
          .send(changeParams);

        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
        expect(result.body.message).toBe('updated');

        const userCheck = await privateTest().get('/api/user', accessToken);
        expect(userCheck.status).toBe(200);
        expect(userCheck.body.success).toBe(true);
        expect(userCheck.body.user['nickname']).toBe(changeParams.nickname);
      });
    });

    describe('/refresh (get)', () => {
      it('액세스 토큰을 전송하면 새로운 액세스 토큰을 반환한다', async () => {
        const result = await privateTest()
          .get('/api/user/refresh', accessToken)
          .set('Cookie', [refreshToken]);
        const newAccessToken = result.body.accessToken;

        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
        expect(typeof newAccessToken === 'string').toBeTruthy();
        expect(accessToken !== newAccessToken).toBeTruthy();
      });
    });
  });

  const bookmarkParamsOne = {
    url: 'https://www.test1.com',
    tagNames: ['여행', '요리'],
  };
  const bookmarkParamsTwo = {
    url: 'https://www.test2.com',
    tagNames: ['인도', '카레'],
  };
  const bookmarkParamsThree = {
    url: 'https://www.test3.com',
    tagNames: ['카레', '요리'],
  };
  const bookmarkResponseDataOne = {
    success: true,
    createdBookmark: {
      id: 'mockBookmarkId',
      url: bookmarkParamsOne.url,
      userId: userResponseDataOne.createdUser.id,
      tags: [
        { id: 'mockTagId_1', tag: '여행' },
        { id: 'mockTagId_2', tag: '요리' },
      ],
    },
  };

  describe('bookmark e2e', () => {
    describe('/ (post)', () => {
      it('정상적인 데이터를 전송하면 북마크를 생성한다.', async () => {
        const result = await privateTest()
          .post('/api/bookmark', accessToken)
          .send(bookmarkParamsOne);

        const createBookmarkTwo = await privateTest()
          .post('/api/bookmark', accessToken)
          .send(bookmarkParamsTwo);
        const createBookmarkThree = await privateTest()
          .post('/api/bookmark', accessToken)
          .send(bookmarkParamsThree);

        bookmarkResponseDataOne.createdBookmark.id =
          result.body.createdBookmark.id;
        expect(result.status).toBe(201);
        expect(result.body.success).toBe(true);
        expect(result.body.createdBookmark['tags'][0]['tag']).toBe(
          bookmarkResponseDataOne.createdBookmark['tags'][0]['tag'],
        );
        expect(result.body.createdBookmark['url']).toBe(
          bookmarkResponseDataOne.createdBookmark['url'],
        );
      });
    });

    describe('/ (get)', () => {
      it('정상적인 데이터를 전송하면 유저가 작성한 모든 북마크를 반환한다.', async () => {
        const keys = ['id', 'url', 'tags'];
        const result = await privateTest().get('/api/bookmark', accessToken);

        const bookmarkArr = result.body.bookmarks;
        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
        expect(bookmarkArr[bookmarkArr.length - 1]['tags'][0]['tag']).toBe(
          bookmarkResponseDataOne.createdBookmark['tags'][0]['tag'],
        );
        expect(bookmarkArr[bookmarkArr.length - 1]['url']).toBe(
          bookmarkResponseDataOne.createdBookmark['url'],
        );
      });
    });

    describe('/search-and (get)', () => {
      it('태그 전부를 만족하는 북마크를 전부 반환한다.', async () => {
        const query = encodeURI('?tags=여행,요리');
        const result = await privateTest().get(
          `/api/bookmark/search-and${query}`,
          accessToken,
        );

        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
        const bookmarks = result.body.bookmarks;
        expect(bookmarks[0]['url']).toBe('https://www.test1.com');
        expect(bookmarks[0]['tags'][0]['tag']).toBe(
          bookmarkResponseDataOne.createdBookmark['tags'][0]['tag'],
        );
      });
    });

    describe('/search-or (get)', () => {
      it('태그 일부를 만족하는 북마크를 전부 반환한다.', async () => {
        const query = encodeURI('?tags=여행,요리');
        const result = await privateTest().get(
          `/api/bookmark/search-or${query}`,
          accessToken,
        );
        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);

        const bookmarks: Array<any> = result.body.bookmarks;
        expect(bookmarks.length).toBe(2);
        expect(bookmarks[bookmarks.length - 1]['url']).toBe(
          'https://www.test1.com',
        );
        expect(bookmarks[bookmarks.length - 1]['tags'][0]['tag']).toBe(
          bookmarkResponseDataOne.createdBookmark['tags'][0]['tag'],
        );
      });
    });

    describe('/:id (patch)', () => {
      const bookmarkId = bookmarkResponseDataOne.createdBookmark.id;
      it('정상적인 데이터를 전송하면 북마크를 변경한다.', async () => {
        const result = await privateTest()
          .patch(`/api/bookmark/${bookmarkId}`, accessToken)
          .send({ changeUrl: 'https://www.test-change.com' });

        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
        expect(result.body.message).toBe('Updated');
      });
    });
  });

  describe('tag e2e', () => {
    const tagParams = { tag: '유원지' };
    const tagResponseData = {
      success: true,
      createdTag: {
        id: 5,
        tag: '유원지',
      },
    };

    describe('/ (post)', () => {
      it('정상적인 데이터를 전송하면 태그를 생성한다.', async () => {
        const result = await privateTest()
          .post('/api/tag', accessToken)
          .send(tagParams);

        expect(result.status).toBe(201);
        expect(result.body.success).toBe(tagResponseData.success);
        expect(result.body.createdTag['tag']).toBe(
          tagResponseData.createdTag['tag'],
        );
      });
    });

    describe('/ (get)', () => {
      it('유저가 작성한 모든 태그를 반환한다.', async () => {
        const targetTags = ['여행', '요리', '인도', '카레' /*'유원지'*/];
        const result = await privateTest().get('/api/tag', accessToken);
        expect(result.status).toBe(200);
        expect(result.body.success).toBe(tagResponseData.success);
        const tags: Array<any> = result.body.tags;
        targetTags.forEach((tag) => {
          expect(
            tags
              .map((tag) => {
                return tag.tag;
              })
              .includes(tag),
          ).toBeTruthy();
        });
      });
    });
  });

  describe('/:bookmark_id (delete)', () => {
    const query = 1;
    const tagIds = [1, 2];
    it('북마크에 담긴 태그를 제거해야 한다', async () => {
      const result = await privateTest().delete(
        `/api/tag/${query}?tag_ids=${tagIds}`,
        accessToken,
      );
      expect(result.status).toBe(200);
      expect(result.body.success).toBe(true);
      expect(result.body.message).toBe('Deleted');
    });
  });

  describe('삭제 테스트', () => {
    describe('bookmark/:id (delete)', () => {
      const bookmarkId = bookmarkResponseDataOne.createdBookmark.id;
      it('정상적인 데이터를 전송하면 북마크를 제거한다.', async () => {
        const result = await privateTest().delete(
          `/api/bookmark/${bookmarkResponseDataOne.createdBookmark.id}`,
          accessToken,
        );

        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
        expect(result.body.message).toBe('Deleted');
      });
    });

    describe('user/ (delete)', () => {
      it('정상적인 데이터를 전송하면 유저정보가 삭제된다', async () => {
        const result = await privateTest().delete('/api/user', accessToken);
        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
        expect(result.body.message).toBe('deleted');
      });
    });
  });

  afterAll(async () => {
    await connectDB.dropDatabase();
    await app.close();
  });
});
