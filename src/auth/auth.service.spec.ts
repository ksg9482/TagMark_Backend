import { HttpService, HttpModule } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from 'src/jwt/jwt.service';
import { TagFactory } from 'src/tag/domain/tag.factory';
import { SecureService } from 'src/utils/secure.service';
import { UtilsService } from 'src/utils/utils.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let secureService: SecureService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UtilsService,
        AuthService,
        SecureService,
        JwtService,
        Logger,
        {
          provide: `CONFIGURATION(config)`,
          useValue: {},
        },
        {
          provide: 'CONFIG_OPTIONS',
          useValue: {},
        },
      ],
    }).compile();
    authService = module.get(AuthService);
    secureService = module.get(SecureService);
    jwtService = module.get(JwtService);
  });

  describe('define', () => {
    it('be defined userService', () => {
      expect(authService).toBeDefined();
    });

    it('be defined secureService', () => {
      expect(secureService).toBeDefined();
    });

    it('be defined jwtService', () => {
      expect(jwtService).toBeDefined();
    });
  });

  describe('getToken', () => {
    it('request의 헤더에 authorization 필드가 없으면 에러를 반환한다.', () => {
      const mockRequest: any = {
        headers: {},
      };
      const mockSecureWrapper = {
        decryptWrapper: jest.fn().mockReturnValue(''),
      };
      secureService.secure().wrapper = jest
        .fn()
        .mockReturnValue(mockSecureWrapper);
      expect(() => {
        authService.getToken(mockRequest);
      }).toThrowError(new Error('No Access Token'));
    });

    it('authorization 필드가 Bearer형식이 아니면 에러를 반환한다.', () => {
      const mockRequest: any = {
        headers: {
          authorization: 'notBearer authorization',
        },
      };
      const mockSecureWrapper = {
        decryptWrapper: jest.fn().mockReturnValue(''),
      };
      secureService.secure().wrapper = jest
        .fn()
        .mockReturnValue(mockSecureWrapper);
      expect(() => {
        authService.getToken(mockRequest);
      }).toThrowError(new Error('No Access Token'));
    });

    it('authorization 필드가 Bearer형식이면 accessToken을 반환한다.', () => {
      const mockRequest: any = {
        headers: {
          authorization: 'Bearer mockAccessToken',
        },
      };
      const mockSecureWrapper = {
        decryptWrapper: jest.fn().mockReturnValue('mockAccessToken'),
      };
      secureService.secure().wrapper = jest
        .fn()
        .mockReturnValue(mockSecureWrapper);
      expect(authService.getToken(mockRequest)).toBe('mockAccessToken');
    });
  });

  describe('accessTokenDecode', () => {
    const mockAccessToken = 'mockAccessToken';
    it('accessToken의 정합성 검사에 실패하면 UnauthorizedException을 반환한다.', () => {
      jwtService.verify = jest.fn().mockImplementation(() => {
        throw new Error();
      });

      expect(() => authService.accessTokenDecode(mockAccessToken)).toThrowError(
        new UnauthorizedException(),
      );
    });

    it('accessToken을 반환한다.', () => {
      jwtService.verify = jest.fn().mockReturnValue(mockAccessToken);

      expect(authService.accessTokenDecode(mockAccessToken)).toBe(
        mockAccessToken,
      );
    });
  });
});
