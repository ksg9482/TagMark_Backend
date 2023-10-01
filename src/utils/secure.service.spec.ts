import { Test } from '@nestjs/testing';
import { JwtService } from 'src/jwt/jwt.service';
import { UserRole, UserType } from 'src/user/domain';
import * as bcrypt from 'bcrypt';
import * as CryptoJS from 'crypto-js';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { SecureService } from './secure.service';

describe('secureService', () => {
  let secureService: SecureService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UtilsService,
        SecureService,
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
    secureService = module.get(SecureService);
  });

  describe('define', () => {
    it('be defined secureService', () => {
      expect(secureService).toBeDefined();
    });
  });

  describe('checkPassword', () => {
    const mockUser = {
      id: 'mock',
      email: 'mockEmail',
      nickname: 'mockNickname',
      password: 'mockpassword',
      role: UserRole.USER,
      type: UserType.BASIC,
    };
    it('비밀번호 검사에 통과하면 true를 반환한다.', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
      expect(
        await secureService.checkPassword(mockUser.password, mockUser),
      ).toBeTruthy();
    });

    it('비밀번호 검사에 통과하지 못하면 false를 반환한다.', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);
      expect(
        await secureService.checkPassword(mockUser.password, mockUser),
      ).toBeFalsy();
    });

    it('비밀번호 검사 자체를 실패하면 false를 반환한다.', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => {
        throw new Error();
      });
      expect(
        await secureService.checkPassword(mockUser.password, mockUser),
      ).toBeFalsy();
    });
  });

  describe('wrapper', () => {
    const mockUser = {
      id: 'mock',
      email: 'mockEmail',
      nickname: 'mockNickname',
      password: 'mockpassword',
      role: UserRole.USER,
      type: UserType.BASIC,
    };
    const mockData = 'mockMessage';

    it('secure().encryptWrapper() 함수는 인코딩된 데이터를 반환한다.', async () => {
      const encryptFn: any = {
        toString: jest.fn().mockReturnValue('mockEncryptValue'),
      };
      jest.spyOn(CryptoJS.AES, 'encrypt').mockImplementation(() => encryptFn);
      expect(secureService.secure().wrapper().encryptWrapper(mockData)).toBe(
        'mockEncryptValue',
      );
    });

    it('secure().decryptWrapper() 함수는 decrypt과정에 실패할 경우 입력한 데이터를 반환한다.', async () => {
      const decryptFn: any = {
        toString: jest.fn().mockReturnValue(false),
      };
      jest.spyOn(CryptoJS.AES, 'decrypt').mockImplementation(() => decryptFn);
      expect(secureService.secure().wrapper().decryptWrapper(mockData)).toBe(
        mockData,
      );
    });

    it('secure().decryptWrapper() 함수는 인코딩된 데이터를 반환한다.', async () => {
      const decryptFn: any = {
        toString: jest.fn().mockReturnValue('mockDecryptValue'),
      };
      jest.spyOn(CryptoJS.AES, 'decrypt').mockImplementation(() => decryptFn);
      expect(secureService.secure().wrapper().decryptWrapper(mockData)).toBe(
        'mockDecryptValue',
      );
    });
  });
});
