import { HttpService, HttpModule } from '@nestjs/axios';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from 'src/jwt/jwt.service';
import { TagFactory } from 'src/tag/domain/tag.factory';
import { SecureService } from 'src/utils/secure.service';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';
import { UserFactory } from '../domain/user.factory';
import { UserEntity } from '../infra/db/entity/user.entity';
import { UserRepository } from '../infra/db/repository/user.repository';
import { UserUseCases } from './user.use-case';
import Configuration from 'src/config/configuration';
import { UserRole, UserType } from '../domain';

describe('bookmark-use-case', () => {
  let userService: UserUseCases;
  let userRepository: UserRepository;
  let userFactory: UserFactory;
  let utilsService: UtilsService;
  let secureService: SecureService;
  let userEntityRepository: Repository<UserEntity>;

  const MockGenericRepository = {
    getAll: jest.fn(),
    get: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const MockUserRepository = {
    ...MockGenericRepository,
    findByEmail: jest.fn(),
    findByEmailAndPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserUseCases,
        {
          provide: 'UserRepository',
          useValue: MockUserRepository,
        },
        UserFactory,
        UtilsService,
        AuthModule,
        {
          provide: 'UserEntityRepository',
          useValue: {
            save: jest.fn(),
          },
        },
        SecureService,
        {
          provide: HttpService,
          useValue: {},
        },
        JwtService,
        {
          provide: 'CONFIG_OPTIONS',
          useValue: {},
        },
        Logger,
        {
          provide: `CONFIGURATION(config)`,
          useValue: {},
        },
      ],
    }).compile();
    userService = module.get(UserUseCases);
    userRepository = module.get('UserRepository');
    userEntityRepository = module.get('UserEntityRepository');
    userFactory = module.get(UserFactory);
    secureService = module.get(SecureService);
  });

  describe('define', () => {
    it('be defined userService', () => {
      expect(userService).toBeDefined();
    });

    it('be defined userRepository', () => {
      expect(userRepository).toBeDefined();
    });

    it('be defined userEntityRepository', () => {
      expect(userEntityRepository).toBeDefined();
    });

    it('be defined userFactory', () => {
      expect(userFactory).toBeDefined();
    });
  });

  describe('createUser', () => {
    it('', () => {
      console.log();
    });
  });
  describe('login', () => {
    it('', () => {
      console.log();
    });
  });
  describe('me', () => {
    it('', () => {
      console.log();
    });
  });
  describe('passwordValid', () => {
    it('', () => {
      console.log();
    });
  });
  describe('editUser', () => {
    it('', () => {
      console.log();
    });
  });
  describe('deleteUser', () => {
    it('', () => {
      console.log();
    });
  });
  describe('refresh', () => {
    it('', () => {
      console.log();
    });
  });
  describe('googleOauth', () => {
    it('', () => {
      console.log();
    });
  });
  describe('getGoogleUserData', () => {
    it('', () => {
      console.log();
    });
  });
  describe('setGoogleUserForm', () => {
    it('', () => {
      console.log();
    });
  });
  describe('findByEmail', () => {
    it('email 검색 결과 해당하는 유저가 없으면 null을 반환한다.', async () => {
      const mockEmail = 'mockEmail';

      userRepository.findByEmail = jest.fn().mockResolvedValue(null);

      expect(await userService.findByEmail(mockEmail)).toBe(null);
    });

    it('email 검색 결과 해당하는 유저가 있으면 user 객체를 반환한다.', async () => {
      const mockEmail = 'mockEmail';

      const mockUser = {
        id: 'mock',
        email: 'mockEmail',
        nickname: 'mockNickname',
        password: 'mockpassword',
        role: UserRole.USER,
        type: UserType.BASIC,
      };
      userRepository.findByEmail = jest.fn().mockResolvedValue(mockUser);

      expect(await userService.findByEmail(mockEmail)).toStrictEqual(mockUser);
    });
  });
  describe('findById', () => {
    it('id 검색 결과 해당하는 유저가 없으면 HttpException을 반환한다.', async () => {
      const mockUserId = 'mockUserId';
      userRepository.get = jest.fn().mockResolvedValue(null);
      await expect(async () => {
        await userService.findById(mockUserId);
      }).rejects.toThrowError(
        new HttpException('User not exists.', HttpStatus.BAD_REQUEST),
      );
    });

    it('id 검색 결과 해당하는 유저가 있으면 user 객체를 반환한다.', async () => {
      const mockUserId = 'mockUserId';

      const mockUser = {
        id: 'mock',
        email: 'mockEmail',
        nickname: 'mockNickname',
        password: 'mockpassword',
        role: UserRole.USER,
        type: UserType.BASIC,
      };
      userRepository.get = jest.fn().mockResolvedValue(mockUser);

      expect(await userService.findById(mockUserId)).toStrictEqual(mockUser);
    });
  });
  describe('deleteUserProperty', () => {
    const mockUser = {
      id: 'mock',
      email: 'mockEmail',
      nickname: 'mockNickname',
      password: 'mockpassword',
      role: UserRole.USER,
      type: UserType.BASIC,
    };

    it('targetProperty가 default인 경우 password와 role이 제거된 user 객체를 반환한다.', () => {
      const defaultTypeUser = {
        id: 'mock',
        email: 'mockEmail',
        nickname: 'mockNickname',
        type: UserType.BASIC,
      };
      expect(userService.deleteUserProperty('default', mockUser)).toStrictEqual(
        defaultTypeUser,
      );
    });

    it('targetProperty가 password인 경우 password가 제거된 user 객체를 반환한다.', () => {
      const passwordTypeUser = {
        id: 'mock',
        email: 'mockEmail',
        nickname: 'mockNickname',
        role: UserRole.USER,
        type: UserType.BASIC,
      };
      expect(
        userService.deleteUserProperty('password', mockUser),
      ).toStrictEqual(passwordTypeUser);
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

    it('잘못된 비밀번호를 입력하면 HttpException을 반환한다.', async () => {
      secureService.checkPassword = jest.fn().mockResolvedValue(false);
      await expect(async () => {
        await userService.checkPassword('mockPassword', mockUser);
      }).rejects.toThrowError(
        new HttpException('Invalid password.', HttpStatus.BAD_REQUEST),
      );
    });

    it('정상적인 비밀번호를 입력하면 true를 반환한다.', async () => {
      secureService.checkPassword = jest.fn().mockResolvedValue(true);
      expect(
        await userService.checkPassword('mockPassword', mockUser),
      ).toBeTruthy();
    });
  });
});
