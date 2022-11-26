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
      }
    }

    describe('/ (post)', () => {
      it('정상적인 데이터를 전송하면 북마크를 생성한다.', async () => {
        const keys = ["id", "url", "tags"]
        await privateTest().post('/api/bookmark', accessToken)
          .send(bookmarkParams)
          .expect(201)
          .expect(resp => {
            expect(resp.body.success).toEqual(bookmarkResponseData.success);
            for (let key of keys) {
              if (key === "tags") {
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
        await privateTest().get('/api/bookmark/mybookmark', accessToken)
          //.then((resp) => { return console.log(resp) })
          .expect(200)
          .expect(resp => {
            expect(resp.body.success).toEqual(bookmarkResponseData.success);
            for (let key of keys) {
              if (key === "tags") {
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
          .send({ changeUrl: "https://www.test-change.com" })
          .expect(200)
          .expect(resp => {
            expect(resp.body.success).toEqual(bookmarkResponseData.success);
            expect(resp.body.message).toEqual('Updated');

          });
      });
    });

    // describe('/:id (delete)', () => {
    //   const bookmarkId = bookmarkResponseData.createdBookmark.id
    //   it('정상적인 데이터를 전송하면 북마크를 제거한다.', async () => {
    //     await privateTest().delete(`/api/bookmark/${bookmarkId}`, accessToken)
    //       //.then((resp) => { return console.log(resp) })
    //       .expect(200)
    //       .expect(resp => {
    //         expect(resp.body.success).toEqual(bookmarkResponseData.success);
    //         expect(resp.body.message).toEqual('Deleted');

    //       });
    //   });
    // });

  });


  //ToDo
  describe('tag e2e', () => {
    const tagParams = { tag: '카레' };
    const tagResponseData = {
      success: true,
      createdTag: {
        id: 3,
        tag: '카레'
      }
    }

    describe('/ (post)', () => {
      it('정상적인 데이터를 전송하면 태그를 생성한다.', async () => {
        const keys = ["id", "tag"]
        await privateTest().post('/api/tag', accessToken)
          .send(tagParams)
          .expect(201)
          .expect(resp => {
            expect(resp.body.success).toEqual(tagResponseData.success);
            for (let key of keys) {
              if (key === "tags") {
                const createdTags = resp.body.createdTag[key]
                expect(createdTags[0]['tag']).toEqual(tagResponseData.createdTag[key][0]['tag']);
              }
              else {
                expect(resp.body.createdTag[key]).toEqual(tagResponseData.createdTag[key]);
              };
            };
          });
      });
    });

    //중간에 다른유저 북마크 넣어서 태그 다른거 생성. 결과적으론 id:1,2,3,4,5. 해당 유저꺼만하면 1,2,3,5 
    describe('/all (get)', () => {
      it('작성된 모든 태그를 반환한다.', async () => {
        const targetTags = ['여행', '요리', '카레'] //다른유저 추가 컴퓨터, 가전
        await privateTest().get('/api/tag/all', accessToken)
          .expect(200)
          .expect(resp => {
            expect(resp.body.success).toEqual(tagResponseData.success);

            const tags: Array<any> = resp.body.tags;
            tags.forEach((tag, i) => {
              expect(tag['tag']).toBe(targetTags[i])
            })
          });
      });
    });

    describe('/ (get)', () => {
      it('유저가 작성한 모든 태그를 반환한다.', async () => {
        const targetTags = ['여행', '요리', '카레']
        await privateTest().get('/api/tag', accessToken)
          .expect(200)
          .expect(resp => {
            expect(resp.body.success).toEqual(tagResponseData.success);

            const tags: Array<any> = resp.body.tags;
            tags.forEach((tag, i) => {
              expect(tag['tag']).toBe(targetTags[i])
            })
          });
      });
    });

    describe('/search-and (get)', () => {
      const bookmarkResponseData = {
        success: true,
        bookmarks: [
          {
            id: 1,
            url: 'https://www.test-change.com', //위에서 바꿨음
            userId: userResponseData.createdUser.id,
            tags: [
              { id: 1, tag: "여행" },
              { id: 2, tag: "요리" }
            ]
          }
        ]
      }
      it('태그 전부를 만족하는 북마크를 전부 반환한다.', async () => {
        const keys = ["id", "url", "tags"]
        //const targetTags = ['여행', '요리', '카레']
        const query = encodeURI('?tags=여행+요리')
        await privateTest().get(`/api/tag/search-and${query}`, accessToken)
          .expect(200)
          .expect(resp => {
            expect(resp.body.success).toEqual(bookmarkResponseData.success);
            const bookmarks = resp.body.bookmarks
            for (let key of keys) {
              if (key === "tags") {
                expect(bookmarks[0][key][0]['tag']).toEqual(bookmarkResponseData.bookmarks[0][key][0]['tag']);
              }
              else {
                expect(bookmarks[0][key]).toEqual(bookmarkResponseData.bookmarks[0][key]);
              };
            };
          });
      });




    });

    describe('/search-or (get)', () => {

      const bookmarkResponseData = {
        success: true,
        bookmarks: [
          {
            id: 1,
            url: 'https://www.test-change.com', //위에서 바꿨음
            userId: userResponseData.createdUser.id,
            tags: [
              { id: 1, tag: "여행" },
              { id: 2, tag: "요리" }
            ]
          }
        ]
      };

      it('태그 일부를 만족하는 북마크를 전부 반환한다.', async () => {

        const bookmarkParams = { url: 'https://www.test-curry.com', tags: ['카레', '인도'] };
        await privateTest().post('/api/bookmark', accessToken).send(bookmarkParams)

        //이게 문제. 중간에 만드는걸로? 아니면 처음부터 넣어서 테스트 수정?
        const keys = ["id", "url", "tags"]
        const query = encodeURI('?tags=여행+요리+카레')
        await privateTest().get(`/api/tag/search-or${query}`, accessToken)
          .expect(200)
          .expect(resp => {
            //console.log(resp.body.bookmarks)
            expect(resp.body.success).toEqual(bookmarkResponseData.success);
            const bookmarks = resp.body.bookmarks
            for (let key of keys) {
              if (key === "tags") {
                expect(bookmarks[0][key][0]['tag']).toEqual(bookmarkResponseData.bookmarks[0][key][0]['tag']);
              }
              else {
                expect(bookmarks[0][key]).toEqual(bookmarkResponseData.bookmarks[0][key]);
              };
            };
          });
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
    //         userId: userResponseData.createdUser.id,
    //         tags: [
    //           { id: 1, tag: "여행" },
    //           { id: 2, tag: "요리" }
    //         ]
    //       }
    //     ]
    //   };
    //   const tagId = tagResponseData.bookmarks[0].tags[1].id
    //   it('정상적인 데이터를 전송하면 태그를 변경한다.', async () => {
    //     await privateTest().patch(`/api/tag/${tagId}`, accessToken)
    //       //.then((resp) => { return console.log(resp) })
    //       .send({ changeTag: "한식" })
    //       .expect(200)
    //       .expect(resp => {
    //         expect(resp.body.success).toEqual(tagResponseData.success);
    //         expect(resp.body.message).toEqual('Updated');
    //       });
    //   });
    // })
  });

  describe('/:bookmark_id (delete)',()=>{
    const query = 1
    const tagIds = [1,2]
    it('북마크에 담긴 태그를 제거해야 한다',async()=>{
      await privateTest().delete(`/api/tag/${query}?tag_ids=${tagIds}`, accessToken)
          .expect(200)
          .expect(resp => {
            expect(resp.body.success).toEqual(true);
            expect(resp.body.message).toEqual('Deleted');
          });

    })
  })




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
