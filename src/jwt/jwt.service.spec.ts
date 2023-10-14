import { Test } from '@nestjs/testing';
import { JwtService } from 'src/jwt/jwt.service';
import { UserRole, UserType } from 'src/user/domain';
import * as jwt from 'jsonwebtoken';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: `CONFIGURATION(config)`,
          useValue: {},
        },
        {
          provide: 'CONFIG_OPTIONS',
          useValue: {
            privateKey: 'fakePrivateKey',
          },
        },
      ],
    }).compile();
    jwtService = module.get(JwtService);
  });

  describe('define', () => {
    it('be defined userService', () => {
      expect(jwtService).toBeDefined();
    });
  });

  describe('sign', () => {
    const fakeUser = {
      id: 'fake',
      email: 'fakeEmail',
      nickname: 'fakeNickname',
      password: 'fakepassword',
      role: UserRole.USER,
      type: UserType.BASIC,
    };
    const fakeAccessToken = 'fakeAccessToken';
    it('accessToken을 반환한다.', () => {
      jest.spyOn(jwt, 'sign').mockImplementation(() => fakeAccessToken);
      expect(jwtService.sign(fakeUser)).toStrictEqual(fakeAccessToken);
    });
  });

  describe('refresh', () => {
    const fakeUser = {
      id: 'fake',
      email: 'fakeEmail',
      nickname: 'fakeNickname',
      password: 'fakepassword',
      role: UserRole.USER,
      type: UserType.BASIC,
    };
    const fakeRefreshToken = 'fakeRefreshToken';
    it('refreshToken을 반환한다.', () => {
      jest.spyOn(jwt, 'sign').mockImplementation(() => fakeRefreshToken);
      expect(jwtService.refresh(fakeUser)).toStrictEqual(fakeRefreshToken);
    });
  });

  describe('verify', () => {
    const fakeUser = {
      id: 'fake',
      email: 'fakeEmail',
      nickname: 'fakeNickname',
      password: 'fakepassword',
      role: UserRole.USER,
      type: UserType.BASIC,
    };
    const fakeAccessToken = 'fakeAccessToken';

    it('accessToken을 검증하여 통과되지 않으면 HttpException을 반환한다.', () => {
      jest
        .spyOn(jwt, 'verify')
        //.mockImplementation(() => false);
        .mockImplementation(() => {
          throw new Error();
        });

      Reflect.deleteProperty(fakeUser, 'password');

      expect(() => jwtService.verify(fakeAccessToken)).toThrowError(
        new HttpException('Token expire', HttpStatus.BAD_REQUEST),
      );
    });

    it('accessToken을 검증하여 비밀번호가 제거된 유저객체를 반환한다.', () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => fakeUser);

      Reflect.deleteProperty(fakeUser, 'password');

      expect(jwtService.verify(fakeAccessToken)).toStrictEqual(fakeUser);
    });
  });

  describe('refreshVerify', () => {
    const fakeUser = {
      id: 'fake',
      email: 'fakeEmail',
      nickname: 'fakeNickname',
      password: 'fakepassword',
      role: UserRole.USER,
      type: UserType.BASIC,
    };
    const fakeRefreshToken = 'fakeRefreshToken';

    it('accessToken을 검증하여 통과되지 않으면 HttpException을 반환한다.', () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => null);

      Reflect.deleteProperty(fakeUser, 'password');

      expect(() => jwtService.refreshVerify(fakeRefreshToken)).toThrowError(
        new HttpException('Token expire', HttpStatus.BAD_REQUEST),
      );
    });

    it('accessToken을 검증하여 비밀번호가 제거된 유저객체를 반환한다.', () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => fakeUser);

      Reflect.deleteProperty(fakeUser, 'password');

      expect(jwtService.refreshVerify(fakeRefreshToken)).toStrictEqual(
        fakeUser,
      );
    });
  });
});
