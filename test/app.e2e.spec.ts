import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { setNestApp } from 'src/main';
import { UserEntity } from 'src/user/infra/db/entity/user.entity';
import * as request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';

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
    setNestApp(app);
    await app.init();
  });

  const userParamsOne = { email: 'test1@test.com', password: '123456' };
  const userResponseDataOne = {
    ok: true,
    createdUser: {
      id: '42ee904c778d1efebe40c0768d766082',
      email: 'test1@test.com',
      nickname: '익명',
      role: 'USER',
      type: 'BASIC',
    },
  };

  describe('auth', () => {
    it('엑세스 토큰이 없으면 엑세스 토큰이 요구되는 기능에 접근하지 못한다', async () => {
      const result = await privateTest().get('/api/bookmark');

      expect(result.status).toBe(403);
      expect(result.body.ok).toBe(false);
      expect(result.body.message).toBe('Forbidden resource');
    });
  });

  describe('user e2e', () => {
    describe('/ (post)', () => {
      it('정상적인 데이터를 전송하면 회원가입한다.', async () => {
        const result = await privateTest()
          .post('/api/user')
          .send(userParamsOne);

        userResponseDataOne.createdUser.id = result.body.data.id;
        expect(result.status).toBe(201);
        expect(result.body.ok).toBe(true);
        expect(typeof result.body.data.id).toBe('string');
      });

      it('이미 가입한 이메일은 다시 가입할 수 없다.', async () => {
        const result = await privateTest()
          .post('/api/user')
          .send(userParamsOne);
        expect(result.status).toBe(400);
        expect(result.body.ok).toBe(false);
        expect(result.body.message).toBe('Email Already exists.');
      });
    });

    describe('/login (post)', () => {
      it('정상적인 데이터를 전송하면 로그인한다', async () => {
        const result = await privateTest()
          .post('/api/user/login')
          .send(userParamsOne);

        console.log(result.body);
        /**
         * id: '42ee904c778d1efebe40c0768d766082',
      email: 'test1@test.com',
      nickname: '익명',
      role: 'USER',
      type: 'BASIC',
         */

        expect(result.status).toBe(201);
        expect(result.body.ok).toBe(true);
        expect(typeof result.body.data.accessToken === 'string').toBeTruthy();
        expect(result.body.data.user.email).toBe('test1@test.com');

        accessToken = result.body.data.accessToken;
        refreshToken = decodeURIComponent(
          result.header['set-cookie'][0].split(';')[0],
        );
      });

      it('아이디가 입력되지 않으면 접속할 수 없다', async () => {
        const mistakeLoginUser = {
          email: '',
          password: userParamsOne.password,
        };
        const result = await privateTest()
          .post('/api/user/login')
          .send(mistakeLoginUser);

        expect(result.status).toBe(400);
        expect(result.body.ok).toBe(false);
        expect(result.body.message).toBe('email should not be empty');
      });

      it('비밀번호가 입력되지 않으면 접속할 수 없다', async () => {
        const mistakeLoginUser = {
          email: userParamsOne.email,
          password: '',
        };
        const result = await privateTest()
          .post('/api/user/login')
          .send(mistakeLoginUser);

        expect(result.status).toBe(400);
        expect(result.body.ok).toBe(false);
        expect(result.body.message).toBe('password should not be empty');
      });

      it('아이디가 이메일 양식이 아니면 접속할 수 없다', async () => {
        const mistakeLoginUser = {
          email: 'notEmailFormId',
          password: userParamsOne.password,
        };
        const result = await privateTest()
          .post('/api/user/login')
          .send(mistakeLoginUser);

        expect(result.status).toBe(400);
        expect(result.body.ok).toBe(false);
        expect(result.body.message).toBe('email must be an email');
      });

      it('비밀번호 길이가 6보다 짧으면 접속할 수 없다', async () => {
        const mistakeLoginUser = {
          email: userParamsOne.email,
          password: '1',
        };
        const result = await privateTest()
          .post('/api/user/login')
          .send(mistakeLoginUser);

        expect(result.status).toBe(400);
        expect(result.body.ok).toBe(false);
        expect(result.body.message).toBe(
          'password must match /^[A-Za-z\\d!@#$%^&*()]{6,30}$/ regular expression',
        );
      });

      it('비밀번호 길이가 30보다 길면 접속할 수 없다', async () => {
        const mistakeLoginUser = {
          email: userParamsOne.email,
          password: '1234567890123456789012345678901234567890',
        };
        const result = await privateTest()
          .post('/api/user/login')
          .send(mistakeLoginUser);

        expect(result.status).toBe(400);
        expect(result.body.ok).toBe(false);
        expect(result.body.message).toBe(
          'password must match /^[A-Za-z\\d!@#$%^&*()]{6,30}$/ regular expression',
        );
      });

      it('틀린 아이디를 입력하면 로그인 할 수 없다', async () => {
        const mistakeLoginUser = {
          email: 'mistake@test.com',
          password: userParamsOne.password,
        };
        const result = await privateTest()
          .post('/api/user/login')
          .send(mistakeLoginUser);

        expect(result.status).toBe(400);
        expect(result.body.ok).toBe(false);
        expect(result.body.message).toBe('User not exists.');
      });

      it('틀린 비밀번호를 입력하면 로그인 할 수 없다', async () => {
        const mistakeLoginUser = {
          email: userParamsOne.email,
          password: 'mistakePassword',
        };
        const result = await privateTest()
          .post('/api/user/login')
          .send(mistakeLoginUser);

        expect(result.status).toBe(400);
        expect(result.body.ok).toBe(false);
        expect(result.body.message).toBe('Invalid password.');
      });
    });

    describe('/ (get)', () => {
      it('로그인한 유저의 정보를 반환한다', async () => {
        const result = await privateTest().get('/api/user', accessToken);
        console.log(result.body.data.user);
        /**
         * id: '42ee904c778d1efebe40c0768d766082',
      email: 'test1@test.com',
      nickname: '익명',
      role: 'USER',
      type: 'BASIC',
         */
        expect(result.status).toBe(200);
        expect(result.body.ok).toBe(true);
        expect(result.body.data.user['email']).toBe('test1@test.com');
      });
    });

    describe('/ (patch)', () => {
      it('정상적인 데이터를 전송하면 유저정보가 변경된다', async () => {
        const changeParams = { nickname: 'new-nickname' };
        const result = await privateTest()
          .patch('/api/user', accessToken)
          .send(changeParams);

        expect(result.status).toBe(200);
        expect(result.body.ok).toBe(true);
        expect(result.body.message).toBe('updated');

        const userCheck = await privateTest().get('/api/user', accessToken);
        expect(userCheck.status).toBe(200);
        expect(userCheck.body.ok).toBe(true);
        expect(userCheck.body.data.user['nickname']).toBe('익명');
      });
    });

    describe('/refresh (get)', () => {
      it('액세스 토큰을 전송하면 새로운 액세스 토큰을 반환한다', async () => {
        const result = await privateTest()
          .get('/api/user/refresh', accessToken)
          .set('Cookie', [refreshToken]);
        const newAccessToken = result.body.accessToken;
        console.log(result.body);
        expect(result.status).toBe(200);
        expect(result.body.ok).toBe(true);
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
    ok: true,
    createdBookmark: {
      id: 'fakeBookmarkId',
      url: bookmarkParamsOne.url,
      userId: userResponseDataOne.createdUser.id,
      tags: [
        { id: 'fakeTagId_1', tag: '여행' },
        { id: 'fakeTagId_2', tag: '요리' },
      ],
    },
  };

  describe('bookmark e2e', () => {
    describe('/ (post)', () => {
      it('정상적인 데이터를 전송하면 북마크를 생성한다.', async () => {
        const result = await privateTest()
          .post('/api/bookmark', accessToken)
          .send(bookmarkParamsOne);

        await privateTest()
          .post('/api/bookmark', accessToken)
          .send(bookmarkParamsTwo);
        await privateTest()
          .post('/api/bookmark', accessToken)
          .send(bookmarkParamsThree);

        bookmarkResponseDataOne.createdBookmark.id =
          result.body.createdBookmark.id;
        expect(result.status).toBe(201);
        expect(result.body.ok).toBe(true);
        expect(result.body.createdBookmark['tags'][0]['tag']).toBe(
          bookmarkResponseDataOne.createdBookmark['tags'][0]['tag'],
        );
        expect(result.body.createdBookmark['url']).toBe(
          bookmarkResponseDataOne.createdBookmark['url'],
        );
      });

      it('중복된 url을 가진 북마크는 새로 생성 할 수 없다.', async () => {
        const result = await privateTest()
          .post('/api/bookmark', accessToken)
          .send(bookmarkParamsOne);

        expect(result.status).toBe(400);
        expect(result.body.ok).toBe(false);
        expect(result.body.message).toBe('Bookmark is aleady exist');
      });

      it('북마크 url이 없으면 생성 할 수 없다.', async () => {
        const noUrlBookmark = {
          tagNames: bookmarkParamsOne.tagNames,
        };
        const result = await privateTest()
          .post('/api/bookmark', accessToken)
          .send(noUrlBookmark);

        expect(result.status).toBe(400);
        expect(result.body.ok).toBe(false);
        expect(result.body.message).toBe('url should not be empty');
      });

      it('북마크 url이 빈 문자열이면 생성 할 수 없다.', async () => {
        const emptyUrlBookmark = {
          url: '',
          tagNames: bookmarkParamsOne.tagNames,
        };
        const result = await privateTest()
          .post('/api/bookmark', accessToken)
          .send(emptyUrlBookmark);

        expect(result.status).toBe(400);
        expect(result.body.ok).toBe(false);
        expect(result.body.message).toBe('url should not be empty');
      });
    });

    describe('/ (get)', () => {
      it('정상적인 데이터를 전송하면 유저가 작성한 모든 북마크를 반환한다.', async () => {
        const result = await privateTest().get('/api/bookmark', accessToken);

        const bookmarkArr = result.body.bookmarks;
        expect(result.status).toBe(200);
        expect(result.body.ok).toBe(true);
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
        expect(result.body.ok).toBe(true);
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
        expect(result.body.ok).toBe(true);

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
      it('정상적인 데이터를 전송하면 북마크를 변경한다.', async () => {
        const result = await privateTest()
          .patch(
            `/api/bookmark/${bookmarkResponseDataOne.createdBookmark.id}`,
            accessToken,
          )
          .send({ url: 'https://www.test-change.com' });

        expect(result.status).toBe(200);
        expect(result.body.ok).toBe(true);
        expect(result.body.message).toBe('Updated');
      });

      it('잘못된 북마크 아이디를 전송하면 북마크를 수정할 수 없다.', async () => {
        const mistakeBookmarkId = 'mistakeBookmarkId';
        const result = await privateTest()
          .patch(`/api/bookmark/${mistakeBookmarkId}`, accessToken)
          .send({ url: 'https://www.test-change.com' });

        expect(result.status).toBe(400);
        expect(result.body.ok).toBe(false);
        expect(result.body.message).toBe('Bookmark not found');
      });

      it('변경할 북마크가 빈 문자열이면 북마크를 수정할 수 없다.', async () => {
        const mistakeBookmarkId = 'mistakeBookmarkId';
        const result = await privateTest()
          .patch(`/api/bookmark/${mistakeBookmarkId}`, accessToken)
          .send({ url: '' });

        expect(result.status).toBe(400);
        expect(result.body.ok).toBe(false);
        expect(result.body.message).toBe('url should not be empty');
      });

      it('변경할 북마크가 빈 객체면 북마크를 수정할 수 없다.', async () => {
        const mistakeBookmarkId = 'mistakeBookmarkId';
        const result = await privateTest()
          .patch(`/api/bookmark/${mistakeBookmarkId}`, accessToken)
          .send({});

        expect(result.status).toBe(400);
        expect(result.body.ok).toBe(false);
        expect(result.body.message).toBe('url should not be empty');
      });
    });

    describe('/sync (post)', () => {
      const syncBookmarkData = {
        bookmarks: [
          {
            url: 'https://test.com',
            id: '1',
            tags: [
              {
                id: '1',
                tag: 'fakeOne',
              },
              {
                id: '2',
                tag: 'fakeTwo',
              },
            ],
          },
        ],
        tagNames: ['fakeOne', 'fakeTwo'],
      };

      const noTagBookmark = {
        bookmarks: [
          {
            url: 'https://test.com',
            id: '1',
            tags: [],
          },
        ],
        tagNames: [],
      };

      const noBookmark = {
        bookmarks: [],
        tagNames: [],
      };

      it('로컬에 저장된 북마크와 태그 데이터를 처리한다.', async () => {
        const result = await privateTest()
          .post(`/api/bookmark/sync`, accessToken)
          .send(syncBookmarkData);

        expect(result.status).toBe(201);
        expect(result.body.ok).toBe(true);
        expect(result.body.message).toBe('synced');
      });

      it('북마크가 없어도 싱크에는 영향을 주지 않는다.', async () => {
        const result = await privateTest()
          .post(`/api/bookmark/sync`, accessToken)
          .send(noBookmark);

        expect(result.status).toBe(201);
        expect(result.body.ok).toBe(true);
        expect(result.body.message).toBe('synced');
      });

      it('북마크에 태그 내용이 없어도 싱크에는 영향을 주지 않는다.', async () => {
        const result = await privateTest()
          .post(`/api/bookmark/sync`, accessToken)
          .send(noTagBookmark);

        expect(result.status).toBe(201);
        expect(result.body.ok).toBe(true);
        expect(result.body.message).toBe('synced');
      });
    });
  });

  describe('tag e2e', () => {
    const tagParams = { tag: '유원지' };
    const tagResponseData = {
      ok: true,
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
        expect(result.body.ok).toBe(tagResponseData.ok);
        expect(result.body.createdTag['tag']).toBe(
          tagResponseData.createdTag['tag'],
        );
      });

      it('태그 객체가 없으면 태그를 생성 할 수 없다.', async () => {
        const result = await privateTest()
          .post('/api/tag', accessToken)
          .send({});

        expect(result.status).toBe(400);
        expect(result.body.ok).toBe(false);
        expect(result.body.message).toBe('tag should not be empty');
      });

      it('태그가 빈 문자열이면 태그를 생성 할 수 없다.', async () => {
        const emptyTag = { tag: '' };
        const result = await privateTest()
          .post('/api/tag', accessToken)
          .send(emptyTag);

        expect(result.status).toBe(400);
        expect(result.body.ok).toBe(false);
        expect(result.body.message).toBe('tag should not be empty');
      });

      it('태그가 숫자면 태그를 생성 할 수 없다.', async () => {
        const emptyTag = { tag: 1 };
        const result = await privateTest()
          .post('/api/tag', accessToken)
          .send(emptyTag);

        expect(result.status).toBe(400);
        expect(result.body.ok).toBe(false);
        expect(result.body.message).toBe('tag must be a string');
      });
    });

    describe('/ (get)', () => {
      it('유저가 작성한 모든 태그를 반환한다.', async () => {
        const targetTags = ['여행', '요리', '인도', '카레' /*'유원지'*/];
        const result = await privateTest().get('/api/tag', accessToken);
        expect(result.status).toBe(200);
        expect(result.body.ok).toBe(tagResponseData.ok);
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
      expect(result.body.ok).toBe(true);
      expect(result.body.message).toBe('Deleted');
    });
  });

  describe('삭제 테스트', () => {
    describe('bookmark/:id (delete)', () => {
      it('정상적인 데이터를 전송하면 북마크를 제거한다.', async () => {
        const result = await privateTest().delete(
          `/api/bookmark/${bookmarkResponseDataOne.createdBookmark.id}`,
          accessToken,
        );

        expect(result.status).toBe(200);
        expect(result.body.ok).toBe(true);
        expect(result.body.message).toBe('Deleted');
      });
    });

    describe('user/ (delete)', () => {
      it('정상적인 데이터를 전송하면 유저정보가 삭제된다', async () => {
        const result = await privateTest().delete('/api/user', accessToken);
        expect(result.status).toBe(200);
        expect(result.body.ok).toBe(true);
        expect(result.body.message).toBe('deleted');
      });
    });
  });

  afterAll(async () => {
    await connectDB.dropDatabase();
    await app.close();
  });
});
