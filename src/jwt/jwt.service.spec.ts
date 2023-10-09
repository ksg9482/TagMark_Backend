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
            privateKey: 'mockPrivateKey',
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
    const mockUser = {
      id: 'mock',
      email: 'mockEmail',
      nickname: 'mockNickname',
      password: 'mockpassword',
      role: UserRole.USER,
      type: UserType.BASIC,
    };
    const mockAccessToken = 'mockAccessToken';
    it('accessToken을 반환한다.', () => {
      jest.spyOn(jwt, 'sign').mockImplementation(() => mockAccessToken);
      expect(jwtService.sign(mockUser)).toStrictEqual(mockAccessToken);
    });
  });

  describe('refresh', () => {
    const mockUser = {
      id: 'mock',
      email: 'mockEmail',
      nickname: 'mockNickname',
      password: 'mockpassword',
      role: UserRole.USER,
      type: UserType.BASIC,
    };
    const mockRefreshToken = 'mockRefreshToken';
    it('refreshToken을 반환한다.', () => {
      jest.spyOn(jwt, 'sign').mockImplementation(() => mockRefreshToken);
      expect(jwtService.refresh(mockUser)).toStrictEqual(mockRefreshToken);
    });
  });

  describe('verify', () => {
    const mockUser = {
      id: 'mock',
      email: 'mockEmail',
      nickname: 'mockNickname',
      password: 'mockpassword',
      role: UserRole.USER,
      type: UserType.BASIC,
    };
    const mockAccessToken = 'mockAccessToken';

    it('accessToken을 검증하여 통과되지 않으면 HttpException을 반환한다.', () => {
      jest
        .spyOn(jwt, 'verify')
        //.mockImplementation(() => false);
        .mockImplementation(() => null);

      Reflect.deleteProperty(mockUser, 'password');

      expect(() => jwtService.verify(mockAccessToken)).toThrowError(
        new HttpException('Token expire', HttpStatus.BAD_REQUEST),
      );
    });

    it('accessToken을 검증하여 비밀번호가 제거된 유저객체를 반환한다.', () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => mockUser);

      Reflect.deleteProperty(mockUser, 'password');

      expect(jwtService.verify(mockAccessToken)).toStrictEqual(mockUser);
    });
  });

  describe('refreshVerify', () => {
    const mockUser = {
      id: 'mock',
      email: 'mockEmail',
      nickname: 'mockNickname',
      password: 'mockpassword',
      role: UserRole.USER,
      type: UserType.BASIC,
    };
    const mockRefreshToken = 'mockRefreshToken';

    it('accessToken을 검증하여 통과되지 않으면 HttpException을 반환한다.', () => {
      jest
        .spyOn(jwt, 'verify')
        .mockImplementation(() => null);

      Reflect.deleteProperty(mockUser, 'password');

      expect(() => jwtService.refreshVerify(mockRefreshToken)).toThrowError(
        new HttpException('Token expire', HttpStatus.BAD_REQUEST),
      );
    });

    it('accessToken을 검증하여 비밀번호가 제거된 유저객체를 반환한다.', () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => mockUser);

      Reflect.deleteProperty(mockUser, 'password');

      expect(jwtService.refreshVerify(mockRefreshToken)).toStrictEqual(
        mockUser,
      );
    });
  });
});
