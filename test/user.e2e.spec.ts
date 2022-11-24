import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    usersRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User))

    await connectDB.initialize();
    await app.init();
  });

  afterAll(async () => {
    await connectDB.dropDatabase()
    await app.close();
  });

  const userParams = { email: 'test@test.com', password: '123456' };
  const createdUser = {
    success: true,
    createdUser: {
      id: 1,
      email: "test@test.com",
      nickname: "익명",
      role: "USER",
      type: "BASIC"
    }
  };

  describe('/ (post)', () => {
    it('정상적인 데이터를 전송면 회원가입한다.', async () => {
      const keys = ["id", "email", "nickname", "role", "type"]
      await request(app.getHttpServer())
        .post('/api/user')
        .send(userParams)
        .expect(201)
        .expect(resp => {
          expect(resp.body.success).toEqual(createdUser.success);
          for (let key of keys) {
            expect(resp.body.createdUser[key]).toEqual(createdUser.createdUser[key]);
          };
        });
    });
  });

  describe('/login (post)', () => {
    it('정상적인 데이터를 전송하면 로그인한다', async () => {
      const keys = ["id", "email", "nickname", "role", "type"]
      await request(app.getHttpServer())
        .post('/api/user/login')
        .send(userParams)
        .expect(201)
        .expect(resp => {
          expect(resp.body.success).toEqual(createdUser.success);
          expect(typeof resp.body.accessToken === 'string').toBeTruthy();
          for (let key of keys) {
            expect(resp.body.user[key]).toEqual(createdUser.createdUser[key]);
          };

          accessToken = resp.body.accessToken;
          refreshToken = resp.header["set-cookie"][0].split(';')[0]
        });
    });
  });

  describe('/ (patch)', () => {
    it('정상적인 데이터를 전송하면 유저정보가 변경된다', async () => {
      const changeParams = { changeNickname: 'changed-nickname' };
      await request(app.getHttpServer())
        .patch('/api/user')
        .set('authorization', `Bearer ${accessToken}`)
        .send(changeParams)
        .expect(200)
        .expect(resp => {
          expect(resp.body.success).toBe(createdUser.success);
          expect(resp.body.message).toBe('updated');
        });
    });
  });

  describe('/refresh (get)', () => {
    it('액세스 토큰을 전송하면 새로운 액세스 토큰을 반환한다', async () => {
      await request(app.getHttpServer())
        .get('/api/user/refresh')
        .set('authorization', `Bearer ${accessToken}`)
        .set("Cookie", [refreshToken])
        .expect(200)
        .expect(resp => {
          expect(resp.body.success).toBe(createdUser.success);
          expect(typeof resp.body.accessToken === 'string').toBeTruthy();
          expect(accessToken !== resp.body.accessToken).toBeTruthy();
        });
    });
  });
  /*
@Post('/google')
  */

  describe('/ (delete)', () => {
    it('정상적인 데이터를 전송하면 유저정보가 삭제된다', async () => {
      await request(app.getHttpServer())
        .delete('/api/user')
        .set('authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(resp => {
          expect(resp.body.success).toBe(createdUser.success);
          expect(resp.body.message).toBe('deleted');
        });
    });
  });

});
