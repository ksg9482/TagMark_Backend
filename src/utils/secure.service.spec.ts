import { Test } from '@nestjs/testing';
// import { UserRole, UserType } from 'src/user/domain';
import * as bcrypt from 'bcrypt';
import * as CryptoJS from 'crypto-js';
import { UtilsService } from './utils.service';
import { SecureService } from './secure.service';
import { UserRoleEnum } from 'src/user/domain/types/userRole';
import { UserTypeEnum } from 'src/user/domain/types/userType';
import { User } from 'src/user/domain';

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
            privateKey: 'fakePrivateKey',
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
    const fakeUser = User.from({
      id: 'fake',
      email: 'fakeEmail',
      nickname: 'fakeNickname',
      password: 'fakepassword',
      role: UserRoleEnum.USER,
      type: UserTypeEnum.BASIC,
    })
    it('비밀번호 검사에 통과하면 true를 반환한다.', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
      expect(
        await secureService.checkPassword(fakeUser.password, fakeUser),
      ).toBeTruthy();
    });

    it('비밀번호 검사에 통과하지 못하면 false를 반환한다.', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);
      expect(
        await secureService.checkPassword(fakeUser.password, fakeUser),
      ).toBeFalsy();
    });

    it('비밀번호 검사 자체를 실패하면 false를 반환한다.', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => {
        throw new Error();
      });
      expect(
        await secureService.checkPassword(fakeUser.password, fakeUser),
      ).toBeFalsy();
    });
  });

  describe('wrapper', () => {
    const fakeData = 'fakeMessage';

    it('secure().encryptWrapper() 함수는 인코딩된 데이터를 반환한다.', async () => {
      const encryptFn: any = {
        toString: jest.fn().mockReturnValue('fakeEncryptValue'),
      };
      jest.spyOn(CryptoJS.AES, 'encrypt').mockImplementation(() => encryptFn);
      expect(secureService.secure().wrapper().encryptWrapper(fakeData)).toBe(
        'fakeEncryptValue',
      );
    });

    it('secure().decryptWrapper() 함수는 decrypt과정에 실패할 경우 입력한 데이터를 반환한다.', async () => {
      const decryptFn: any = {
        toString: jest.fn().mockReturnValue(false),
      };
      jest.spyOn(CryptoJS.AES, 'decrypt').mockImplementation(() => decryptFn);
      expect(secureService.secure().wrapper().decryptWrapper(fakeData)).toBe(
        fakeData,
      );
    });

    it('secure().decryptWrapper() 함수는 인코딩된 데이터를 반환한다.', async () => {
      const decryptFn: any = {
        toString: jest.fn().mockReturnValue('fakeDecryptValue'),
      };
      jest.spyOn(CryptoJS.AES, 'decrypt').mockImplementation(() => decryptFn);
      expect(secureService.secure().wrapper().decryptWrapper(fakeData)).toBe(
        'fakeDecryptValue',
      );
    });
  });
});
