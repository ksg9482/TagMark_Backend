import { Logger, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from 'src/jwt/jwt.service';
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
      const fakeRequest: any = {
        headers: {},
      };
      const fakeSecureWrapper = {
        decryptWrapper: jest.fn().mockReturnValue(''),
      };
      secureService.secure().wrapper = jest
        .fn()
        .mockReturnValue(fakeSecureWrapper);
      expect(() => {
        authService.getToken(fakeRequest);
      }).toThrowError(new Error('No Access Token'));
    });

    it('authorization 필드가 Bearer형식이 아니면 에러를 반환한다.', () => {
      const fakeRequest: any = {
        headers: {
          authorization: 'notBearer authorization',
        },
      };
      const fakeSecureWrapper = {
        decryptWrapper: jest.fn().mockReturnValue(''),
      };
      secureService.secure().wrapper = jest
        .fn()
        .mockReturnValue(fakeSecureWrapper);
      expect(() => {
        authService.getToken(fakeRequest);
      }).toThrowError(new Error('No Access Token'));
    });

    it('authorization 필드가 Bearer형식이면 accessToken을 반환한다.', () => {
      const fakeRequest: any = {
        headers: {
          authorization: 'Bearer fakeAccessToken',
        },
      };
      const fakeSecureWrapper = {
        decryptWrapper: jest.fn().mockReturnValue('fakeAccessToken'),
      };
      secureService.secure().wrapper = jest
        .fn()
        .mockReturnValue(fakeSecureWrapper);
      expect(authService.getToken(fakeRequest)).toBe('fakeAccessToken');
    });
  });

  describe('accessTokenDecode', () => {
    const fakeAccessToken = 'fakeAccessToken';
    it('accessToken의 정합성 검사에 실패하면 UnauthorizedException을 반환한다.', () => {
      jwtService.verify = jest.fn().mockImplementation(() => {
        throw new Error();
      });

      expect(() => authService.accessTokenDecode(fakeAccessToken)).toThrowError(
        new UnauthorizedException(),
      );
    });

    it('accessToken을 반환한다.', () => {
      jwtService.verify = jest.fn().mockReturnValue(fakeAccessToken);

      expect(authService.accessTokenDecode(fakeAccessToken)).toBe(
        fakeAccessToken,
      );
    });
  });
});
