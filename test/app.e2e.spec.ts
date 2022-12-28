import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository, DataSource } from 'typeorm';
import { User } from 'src/frameworks/data-services/postgresql/model';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { secure } from 'src/utils/secure';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>
  let config: ConfigService = new ConfigService()
  let connectDB: DataSource = new DataSource({
    type: "postgres",
    host: config.get('DB_HOST'),
    port: Number(config.get('DB_PORT')),
    username: config.get('DB_USERNAME'),
    password: config.get('DB_PASSWORD'),
    database: config.get('DB_NAME'),
    entities: [__dirname + '../**/*.model{.ts,.js}'],
  })
  let accessToken: string;
  let refreshToken: string;

  const baseTest = () => request(app.getHttpServer())
  const privateTest = () => {
    return {
      get: (url: string, accessToken?: string) => { return accessToken ? baseTest().get(url).set('authorization', `Bearer ${accessToken}`) : baseTest().get(url) },
      post: (url: string, accessToken?: string) => { return accessToken ? baseTest().post(url).set('authorization', `Bearer ${accessToken}`) : baseTest().post(url) },
      patch: (url: string, accessToken: string) => { return baseTest().patch(url).set('authorization', `Bearer ${accessToken}`) },
      delete: (url: string, accessToken: string) => { return baseTest().delete(url).set('authorization', `Bearer ${accessToken}`) }
    }
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    usersRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User))

    await connectDB.initialize();
    await app.init();
  });



  const userParamsOne = { email: 'test1@test.com', password: '123456' };
  const userParamsTwo = { email: 'test2@test.com', password: '123456' };
  const userParamsThree = { email: 'test3@test.com', password: '123456' };
  const userResponseDataOne = {
    success: true,
    createdUser: {
      id: 1, email: "test1@test.com", nickname: "익명", role: "USER", type: "BASIC"
    }
  };

  const secureWrap = secure().wrapper()

  describe('user e2e', () => {
    describe('/ (post)', () => {
      it('정상적인 데이터를 전송하면 회원가입한다.', async () => {
        let signupData = {
          email: "",
          password: ""
      };
        signupData.email = secureWrap.encryptWrapper(userParamsOne.email)
        signupData.password = secureWrap.encryptWrapper(userParamsOne.password)
        const result = await privateTest().post('/api/user').send(signupData)

        expect(result.status).toBe(201)
        expect(result.body.success).toBe(true);
        expect(result.body.createdUser["email"]).toBe(userResponseDataOne.createdUser["email"]);
      });
    });

    describe('/login (post)', () => {
      it('정상적인 데이터를 전송하면 로그인한다', async () => {
        let loginData = {
          email: "",
          password: ""
      };
        loginData.email = secureWrap.encryptWrapper(userParamsOne.email)
        loginData.password = secureWrap.encryptWrapper(userParamsOne.password)
        const result = await privateTest().post('/api/user/login').send(loginData)

        expect(result.status).toBe(201)
        expect(result.body.success).toBe(true);
        expect(typeof result.body.accessToken === 'string').toBeTruthy();
        expect(result.body.user["email"]).toBe(userResponseDataOne.createdUser["email"]);

        accessToken = result.body.accessToken;
        refreshToken = decodeURIComponent(result.header["set-cookie"][0].split(';')[0])
      });
    });

    describe('/ (get)', () => {
      it('로그인한 유저의 정보를 반환한다', async () => {
        const keys = ["id", "email", "nickname", "role", "type"]
        const result = await privateTest().get('/api/user', accessToken);

        expect(result.status).toBe(200)
        expect(result.body.success).toBe(true);
        expect(result.body.user["email"]).toBe(userResponseDataOne.createdUser["email"]);
      });
    });

    describe('/ (patch)', () => {
      it('정상적인 데이터를 전송하면 유저정보가 변경된다', async () => {
        const changeParams = { changeNickname: 'changed-nickname' };
        const result = await privateTest().patch('/api/user', accessToken).send(changeParams)

        expect(result.status).toBe(200)
        expect(result.body.success).toBe(true);
        expect(result.body.message).toBe('updated');


        const userCheck = await privateTest().get('/api/user', accessToken)
        expect(userCheck.status).toBe(200)
        expect(userCheck.body.success).toBe(true);
        expect(userCheck.body.user['nickname']).toBe(changeParams.changeNickname);
      });
    });

    describe('/refresh (get)', () => {
      it('액세스 토큰을 전송하면 새로운 액세스 토큰을 반환한다', async () => {
        const result = await privateTest().get('/api/user/refresh', accessToken).set("Cookie", [refreshToken])
        const newAccessToken = result.body.accessToken;

        expect(result.status).toBe(200)
        expect(result.body.success).toBe(true);
        expect(typeof newAccessToken === 'string').toBeTruthy();
        expect(accessToken !== newAccessToken).toBeTruthy();
      });
    });
  });

  const bookmarkParamsOne = { url: 'https://www.test1.com', tagNames: ['여행', '요리'] };
  const bookmarkParamsTwo = { url: 'https://www.test2.com', tagNames: ['인도', '카레'] };
  const bookmarkParamsThree = { url: 'https://www.test3.com', tagNames: ['카레', '요리'] };
  const bookmarkResponseDataOne = {
    success: true,
    createdBookmark: {
      id: 1,
      url: bookmarkParamsOne.url,
      userId: userResponseDataOne.createdUser.id,
      tags: [{ id: 1, tag: "여행" }, { id: 2, tag: "요리" }]
    }
  }

  //이거 분리할 수 있을까?
  describe('bookmark e2e', () => {


    describe('/ (post)', () => {
      it('정상적인 데이터를 전송하면 북마크를 생성한다.', async () => {
        const result = await privateTest().post('/api/bookmark', accessToken).send(bookmarkParamsOne);

        const createBookmarkTwo = await privateTest().post('/api/bookmark', accessToken).send(bookmarkParamsTwo)
        const createBookmarkThree = await privateTest().post('/api/bookmark', accessToken).send(bookmarkParamsThree)
        
        expect(result.status).toBe(201)
        expect(result.body.success).toBe(true);
        expect(result.body.createdBookmark["tags"][0]['tag']).toBe(bookmarkResponseDataOne.createdBookmark["tags"][0]['tag']);
        expect(result.body.createdBookmark["url"]).toBe(bookmarkResponseDataOne.createdBookmark["url"]);
      });

    });

    //여기선 날짜가 같이 안나옴. 이걸로 양식 통일
    describe('/ (get)', () => {
      it('정상적인 데이터를 전송하면 유저가 작성한 모든 북마크를 반환한다.', async () => {
        const keys = ["id", "url", "tags"]
        const result = await privateTest().get('/api/bookmark', accessToken)

        const bookmarkArr = result.body.bookmarks
        expect(result.status).toBe(200)
        expect(result.body.success).toBe(true);
        expect(bookmarkArr[bookmarkArr.length-1]["tags"][0]['tag']).toBe(bookmarkResponseDataOne.createdBookmark["tags"][0]['tag']);
        expect(bookmarkArr[bookmarkArr.length-1]["url"]).toBe(bookmarkResponseDataOne.createdBookmark["url"]);

      });
    });

    describe('/:id (patch)', () => {
      const bookmarkId = bookmarkResponseDataOne.createdBookmark.id
      it('정상적인 데이터를 전송하면 북마크를 변경한다.', async () => {
        const result = await privateTest().patch(`/api/bookmark/${bookmarkId}`, accessToken).send({ changeUrl: "https://www.test-change.com" })

        expect(result.status).toBe(200)
        expect(result.body.success).toBe(true);
        expect(result.body.message).toBe('Updated');
      });
    });

    // describe('/:id (delete)', () => {
    //   const bookmarkId = bookmarkResponseDataOne.createdBookmark.id
    //   it('정상적인 데이터를 전송하면 북마크를 제거한다.', async () => {
    //     const result = await privateTest().delete(`/api/bookmark/${bookmarkId}`, accessToken)
    //       //.then((resp) => { return console.log(resp) })
    //       expect(result.status).toBe(200)
    //       .expect(resp => {
    //         expect(result.body.success).toBe(true);
    //         expect(result.body.message).toBe('Deleted');

    //       });
    //   });
    // });

  });


  describe('tag e2e', () => {
    const tagParams = { tag: '유원지' };
    const tagResponseData = {
      success: true,
      createdTag: {
        id: 5,
        tag: '유원지'
      }
    }

    describe('/ (post)', () => {
      it('정상적인 데이터를 전송하면 태그를 생성한다.', async () => {
        const result = await privateTest().post('/api/tag', accessToken).send(tagParams);

        expect(result.status).toBe(201);
        expect(result.body.success).toBe(tagResponseData.success);
        expect(result.body.createdTag['tag']).toBe(tagResponseData.createdTag['tag']);
      });
    });

    describe('/all (get)', () => {
      it('작성된 모든 태그를 반환한다.', async () => {
        const targetTags = ['여행', '요리', '인도', '카레', '유원지'] 
        const result = await privateTest().get('/api/tag/all', accessToken)
        expect(result.status).toBe(200)
        expect(result.body.success).toBe(tagResponseData.success);

        const tags: Array<any> = result.body.tags;
        tags.forEach((tag, i) => {
          expect(tag['tag']).toBe(targetTags[i])
        })
      });
    });

    describe('/ (get)', () => {
      it('유저가 작성한 모든 태그를 반환한다.', async () => {
        //비동기라 바로 위껀 안들어간 채로 실행했나?
        const targetTags = ['여행', '요리', '인도', '카레', /*'유원지'*/]
        const result = await privateTest().get('/api/tag', accessToken)
        expect(result.status).toBe(200)
        expect(result.body.success).toBe(tagResponseData.success);
        const tags: Array<any> = result.body.tags;
        // tags.forEach((tag, i) => {
        //   expect(targetTags.includes(tag.tag)).toBeTruthy()
        // })
        targetTags.forEach((tag) => {
          expect(tags.map((tag)=>{return tag.tag}).includes(tag)).toBeTruthy()
        })
      });
    });

    describe('/search-and (get)', () => {

      it('태그 전부를 만족하는 북마크를 전부 반환한다.', async () => {
        const query = encodeURI('?tags=여행,요리')
        const result = await privateTest().get(`/api/tag/search-and${query}`, accessToken)

        expect(result.status).toBe(200)
        expect(result.body.success).toBe(true);
        const bookmarks = result.body.bookmarks;
        expect(bookmarks[0]["url"]).toBe('https://www.test-change.com');
        expect(bookmarks[0]["tags"][0]['tag']).toBe(bookmarkResponseDataOne.createdBookmark["tags"][0]['tag']);
      });




    });

    describe('/search-or (get)', () => {

      it('태그 일부를 만족하는 북마크를 전부 반환한다.', async () => {
        const query = encodeURI('?tags=여행,요리')
        const result = await privateTest().get(`/api/tag/search-or${query}`, accessToken)
        expect(result.status).toBe(200)
        expect(result.body.success).toBe(true);

        const bookmarks:Array<any> = result.body.bookmarks;
        expect(bookmarks.length).toBe(2);
        expect(bookmarks[bookmarks.length-1]["url"]).toBe('https://www.test-change.com');
        expect(bookmarks[bookmarks.length-1]["tags"][0]['tag']).toBe(bookmarkResponseDataOne.createdBookmark["tags"][0]['tag']);
      });
    });

    //내꺼 북마크에 있는 태그 바꾸는 건 이미 있다. 이건 태그 그 자체 변경. 이거 공개해야 하는가?
    // describe('/:id (patch)', () => {
    //   const tagResponseData = {
    //     success: true,
    //     bookmarks: [
    //       {
    //         id: 1,
    //         url: 'https://www.test-change.com', //위에서 바꿨음
    //         userId: userResponseDataOne.createdUser.id,
    //         tags: [
    //           { id: 1, tag: "여행" },
    //           { id: 2, tag: "요리" }
    //         ]
    //       }
    //     ]
    //   };
    //   const tagId = tagResponseData.bookmarks[0].tags[1].id
    //   it('정상적인 데이터를 전송하면 태그를 변경한다.', async () => {
    //     const result = await privateTest().patch(`/api/tag/${tagId}`, accessToken)
    //       //.then((resp) => { return console.log(resp) })
    //       .send({ changeTag: "한식" })
    //       expect(result.status).toBe(200)
    //       .expect(resp => {
    //         expect(result.body.success).toBe(tagResponseData.success);
    //         expect(result.body.message).toBe('Updated');
    //       });
    //   });
    // })
  });

  describe('/:bookmark_id (delete)', () => {
    const query = 1
    const tagIds = [1, 2]
    it('북마크에 담긴 태그를 제거해야 한다', async () => {
      const result = await privateTest().delete(`/api/tag/${query}?tag_ids=${tagIds}`, accessToken)
      expect(result.status).toBe(200)
      expect(result.body.success).toBe(true);
      expect(result.body.message).toBe('Deleted');

    })
  })




  /*
@Post('/google')
  */

  afterAll(async () => {
    // describe('/ (delete)', () => {
    //   it('정상적인 데이터를 전송하면 유저정보가 삭제된다', async () => {
    //     const result = await privateTest().delete('/api/user', accessToken)
    //       expect(result.status).toBe(200)
    //       .expect(resp => {
    //         expect(result.body.success).toBe(createdUser.success);
    //         expect(result.body.message).toBe('deleted');
    //       });
    //   });
    // });

    await connectDB.dropDatabase()
    await app.close();
  });
});
