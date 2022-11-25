import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository, DataSource } from 'typeorm';
import { User } from 'src/frameworks/data-services/postgresql/model';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

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
    entities: [__dirname + '../**/*.model{.ts,.js}']
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



  const userParams = { email: 'test@test.com', password: '123456' };
  const userResponseData = {
    success: true,
    createdUser: {
      id: 1,
      email: "test@test.com",
      nickname: "익명",
      role: "USER",
      type: "BASIC"
    }
  };

  describe('user e2e', () => {
    describe('/ (post)', () => {
      it('정상적인 데이터를 전송하면 회원가입한다.', async () => {
        const keys = ["id", "email", "nickname", "role", "type"]
        await privateTest().post('/api/user')
          .send(userParams)
          .expect(201)
          .expect(resp => {
            expect(resp.body.success).toEqual(userResponseData.success);
            for (let key of keys) {
              expect(resp.body.createdUser[key]).toEqual(userResponseData.createdUser[key]);
            };
          });

      });
    });

    describe('/login (post)', () => {
      it('정상적인 데이터를 전송하면 로그인한다', async () => {
        const keys = ["id", "email", "nickname", "role", "type"]
        await privateTest().post('/api/user/login')
          .send(userParams)
          .expect(201)
          .expect(resp => {
            expect(resp.body.success).toEqual(userResponseData.success);
            expect(typeof resp.body.accessToken === 'string').toBeTruthy();
            for (let key of keys) {
              expect(resp.body.user[key]).toEqual(userResponseData.createdUser[key]);
            };

            accessToken = resp.body.accessToken;
            refreshToken = resp.header["set-cookie"][0].split(';')[0]
          });
      });
    });

    describe('/ (get)', () => {
      it('로그인한 유저의 정보를 반환한다', async () => {
        const keys = ["id", "email", "nickname", "role", "type"]
        await privateTest().get('/api/user', accessToken)
          .expect(200)
          .expect(resp => {
            expect(resp.body.success).toBe(userResponseData.success);
            for (let key of keys) {
              expect(resp.body.user[key]).toEqual(userResponseData.createdUser[key]);
            };
          });
      });
    });

    describe('/ (patch)', () => {
      it('정상적인 데이터를 전송하면 유저정보가 변경된다', async () => {
        const changeParams = { changeNickname: 'changed-nickname' };
        await privateTest().patch('/api/user', accessToken)
          .send(changeParams)
          .expect(200)
          .expect(resp => {
            expect(resp.body.success).toBe(userResponseData.success);
            expect(resp.body.message).toBe('updated');
          });


        await privateTest().get('/api/user', accessToken)
          .expect(200)
          .expect(resp => {
            expect(resp.body.success).toBe(userResponseData.success);
            expect(resp.body.user['nickname']).toEqual(changeParams.changeNickname);
          });
      });
    });

    describe('/refresh (get)', () => {
      it('액세스 토큰을 전송하면 새로운 액세스 토큰을 반환한다', async () => {
        await privateTest().get('/api/user/refresh', accessToken)
          .set("Cookie", [refreshToken])
          .expect(200)
          .expect(resp => {
            expect(resp.body.success).toBe(userResponseData.success);
            expect(typeof resp.body.accessToken === 'string').toBeTruthy();
            expect(accessToken !== resp.body.accessToken).toBeTruthy();
          });
      });
    });
  });

  //이거 분리할 수 있을까?
  describe('bookmark e2e', () => {
    const bookmarkParams = { url: 'https://www.test.com', tags: ['여행', '요리'] };
    const bookmarkResponseData = {
      success: true,
      createdBookmark: {
        id: 1,
        url: bookmarkParams.url,
        userId: userResponseData.createdUser.id,
        tags: [
          { id: 1, tag: "여행" },
          { id: 2, tag: "요리" }
        ]
        //tags: []
      }
    }

    describe('/ (post)', () => {
      it('정상적인 데이터를 전송하면 북마크를 생성한다.', async () => {
        const keys = ["id", "url", "tags"]
        await privateTest().post('/api/bookmark',accessToken)
          //.send({ url: bookmarkParams.url })
          .send(bookmarkParams)
          //.then((resp) => { return console.log(resp) })
          .expect(201)
          .expect(resp => {
            expect(resp.body.success).toEqual(bookmarkResponseData.success);
            for (let key of keys) {
              if(key === "tags"){
                expect(resp.body.createdBookmark[key][0]['tag']).toEqual(bookmarkResponseData.createdBookmark[key][0]['tag']);
              }
              else {
                expect(resp.body.createdBookmark[key]).toEqual(bookmarkResponseData.createdBookmark[key]);
              };
            };
          });
      });
    });

    //여기선 날짜가 같이 안나옴. 이걸로 양식 통일
    describe('/mybookmark (post)', () => {
      it('정상적인 데이터를 전송하면 유저가 작성한 모든 북마크를 반환한다.', async () => {
        const keys = ["id", "url", "tags"]
        await privateTest().get('/api/bookmark/mybookmark',accessToken)
          //.then((resp) => { return console.log(resp) })
          .expect(200)
          .expect(resp => {
            expect(resp.body.success).toEqual(bookmarkResponseData.success);
            for (let key of keys) {
              if(key === "tags"){
                expect(resp.body.bookmarks[0][key][0]['tag']).toEqual(bookmarkResponseData.createdBookmark[key][0]['tag']);
              }
              else {
                expect(resp.body.bookmarks[0][key]).toEqual(bookmarkResponseData.createdBookmark[key]);
              };
            };
          });
      });
    });

    describe('/:id (patch)', () => {
      const bookmarkId = bookmarkResponseData.createdBookmark.id
      it('정상적인 데이터를 전송하면 북마크를 변경한다.', async () => {
        await privateTest().patch(`/api/bookmark/${bookmarkId}`, accessToken)
          //.then((resp) => { return console.log(resp) })
          .send({changeUrl:"https://www.test-change.com"})
          .expect(200)
          .expect(resp => {
            expect(resp.body.success).toEqual(bookmarkResponseData.success);
            expect(resp.body.message).toEqual('Updated');
            
          });
      });
    });

    describe('/:id (delete)', () => {
      const bookmarkId = bookmarkResponseData.createdBookmark.id
      it('정상적인 데이터를 전송하면 북마크를 제거한다.', async () => {
        await privateTest().delete(`/api/bookmark/${bookmarkId}`, accessToken)
          //.then((resp) => { return console.log(resp) })
          .expect(200)
          .expect(resp => {
            expect(resp.body.success).toEqual(bookmarkResponseData.success);
            expect(resp.body.message).toEqual('Deleted');
            
          });
      });
    });

  });


  //ToDo
  describe('tag e2e', () => {
    const bookmarkParams = { url: 'https://www.test.com', tags: ['여행', '요리'] };
    const bookmarkResponseData = {
      success: true,
      createdBookmark: {
        id: 1,
        url: bookmarkParams.url,
        userId: userResponseData.createdUser.id,
        tags: [
          { id: 1, tag: "여행" },
          { id: 2, tag: "요리" }
        ]
        //tags: []
      }
    }

    describe('/ (post)', () => {
      it('정상적인 데이터를 전송하면 북마크를 생성한다.', async () => {
        const keys = ["id", "url", "tags"]
        await privateTest().post('/api/bookmark',accessToken)
          //.send({ url: bookmarkParams.url })
          .send(bookmarkParams)
          //.then((resp) => { return console.log(resp) })
          .expect(201)
          .expect(resp => {
            expect(resp.body.success).toEqual(bookmarkResponseData.success);
            for (let key of keys) {
              if(key === "tags"){
                expect(resp.body.createdBookmark[key][0]['tag']).toEqual(bookmarkResponseData.createdBookmark[key][0]['tag']);
              }
              else {
                expect(resp.body.createdBookmark[key]).toEqual(bookmarkResponseData.createdBookmark[key]);
              };
            };
          });
      });
    });

    //여기선 날짜가 같이 안나옴. 이걸로 양식 통일
    describe('/mybookmark (post)', () => {
      it('정상적인 데이터를 전송하면 유저가 작성한 모든 북마크를 반환한다.', async () => {
        const keys = ["id", "url", "tags"]
        await privateTest().get('/api/bookmark/mybookmark',accessToken)
          //.then((resp) => { return console.log(resp) })
          .expect(200)
          .expect(resp => {
            expect(resp.body.success).toEqual(bookmarkResponseData.success);
            for (let key of keys) {
              if(key === "tags"){
                expect(resp.body.bookmarks[0][key][0]['tag']).toEqual(bookmarkResponseData.createdBookmark[key][0]['tag']);
              }
              else {
                expect(resp.body.bookmarks[0][key]).toEqual(bookmarkResponseData.createdBookmark[key]);
              };
            };
          });
      });
    });

    describe('/:id (patch)', () => {
      const bookmarkId = bookmarkResponseData.createdBookmark.id
      it('정상적인 데이터를 전송하면 북마크를 변경한다.', async () => {
        await privateTest().patch(`/api/bookmark/${bookmarkId}`, accessToken)
          //.then((resp) => { return console.log(resp) })
          .send({changeUrl:"https://www.test-change.com"})
          .expect(200)
          .expect(resp => {
            expect(resp.body.success).toEqual(bookmarkResponseData.success);
            expect(resp.body.message).toEqual('Updated');
            
          });
      });
    });

    describe('/:id (delete)', () => {
      const bookmarkId = bookmarkResponseData.createdBookmark.id
      it('정상적인 데이터를 전송하면 북마크를 제거한다.', async () => {
        await privateTest().delete(`/api/bookmark/${bookmarkId}`, accessToken)
          //.then((resp) => { return console.log(resp) })
          .expect(200)
          .expect(resp => {
            expect(resp.body.success).toEqual(bookmarkResponseData.success);
            expect(resp.body.message).toEqual('Deleted');
            
          });
      });
    });

  });





  /*
@Post('/google')
  */

  afterAll(async () => {
    // describe('/ (delete)', () => {
    //   it('정상적인 데이터를 전송하면 유저정보가 삭제된다', async () => {
    //     await privateTest().delete('/api/user', accessToken)
    //       .expect(200)
    //       .expect(resp => {
    //         expect(resp.body.success).toBe(createdUser.success);
    //         expect(resp.body.message).toBe('deleted');
    //       });
    //   });
    // });

    await connectDB.dropDatabase()
    await app.close();
  });
});
