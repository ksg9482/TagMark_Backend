import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from 'src/jwt/jwt.service';
import { SecureService } from 'src/utils/secure.service';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';
import { UserFactory } from '../domain/user.factory';
import { UserEntity } from '../infra/db/entity/user.entity';
import { UserRepository } from '../infra/db/repository/user.repository';
import { UserUseCases } from './user.use-case';
import { UserRole, UserType } from '../domain';

describe('bookmark-use-case', () => {
  let userService: UserUseCases;
  let userRepository: UserRepository;
  let userFactory: UserFactory;
  let utilsService: UtilsService;
  let secureService: SecureService;
  let httpService: HttpService;
  let jwtService: JwtService;
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
          useValue: {
            axiosRef: {
              get: jest.fn(),
            },
          },
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
    httpService = module.get(HttpService);
    jwtService = module.get(JwtService);
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
    const mockUser = {
      id: 'mock',
      email: 'mockEmail',
      nickname: 'mockNickname',
      password: 'mockpassword',
      role: UserRole.USER,
      type: UserType.BASIC,
    };
    it('이미 등록된 유저이면 HttpException을 반환한다.', async () => {
      userService.findByEmail = jest.fn().mockResolvedValue(mockUser);

      await expect(async () => {
        await userService.createUser(mockUser.email, mockUser.password);
      }).rejects.toThrowError(
        new HttpException('Email Already exists.', HttpStatus.BAD_REQUEST),
      );
    });
    it('이미 등록된 유저이면 HttpException을 반환한다.', async () => {
      userService.findByEmail = jest.fn().mockResolvedValue(mockUser);

      await expect(async () => {
        await userService.createUser(mockUser.email, mockUser.password);
      }).rejects.toThrowError(
        new HttpException('Email Already exists.', HttpStatus.BAD_REQUEST),
      );
    });

    it('유저를 생성하고 생성한 유저 객체를 반환한다.', async () => {
      userService.findByEmail = jest.fn().mockResolvedValue(null);
      userRepository.save = jest.fn().mockResolvedValue(mockUser);
      Reflect.deleteProperty(mockUser, 'password');
      Reflect.deleteProperty(mockUser, 'role');
      expect(
        await userService.createUser(mockUser.email, mockUser.password),
      ).toStrictEqual(mockUser);
    });
  });
  describe('login', () => {
    const mockUser = {
      id: 'mock',
      email: 'mockEmail',
      nickname: 'mockNickname',
      password: 'mockpassword',
      role: UserRole.USER,
      type: UserType.BASIC,
    };
    const mockAccessToken = 'mockAccessToken';
    const mockRefreshToken = 'mockRefreshToken';
    it('등록되지 않은 유저일 경우 HttpException을 반환한다.', async () => {
      userService.findByEmail = jest.fn().mockResolvedValue(null);

      await expect(async () => {
        await userService.login(mockUser.email, mockUser.password);
      }).rejects.toThrowError(
        new HttpException('User not exists.', HttpStatus.BAD_REQUEST),
      );
    });

    it('로그인에 성공 할 경우 유저 객체와 access token, refresh token을 반환한다.', async () => {
      userService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      userService.checkPassword = jest.fn().mockResolvedValue(true);

      jwtService.refresh = jest.fn().mockReturnValue(mockRefreshToken);
      jwtService.sign = jest.fn().mockReturnValue(mockAccessToken);

      Reflect.deleteProperty(mockUser, 'password');
      Reflect.deleteProperty(mockUser, 'role');

      expect(
        await userService.login(mockUser.email, mockUser.password),
      ).toStrictEqual({
        user: mockUser,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });
  });
  describe('me', () => {
    const mockUser = {
      id: 'mock',
      email: 'mockEmail',
      nickname: 'mockNickname',
      password: 'mockpassword',
      role: UserRole.USER,
      type: UserType.BASIC,
    };
    const passwordDeletedMockUser = {
      id: 'mock',
      email: 'mockEmail',
      nickname: 'mockNickname',
      type: UserType.BASIC,
    };
    it('password와 role이 프로퍼티가 제거된 유저 객체를 반환한다.', async () => {
      userService.findById = jest.fn().mockResolvedValue(mockUser);
      expect(await userService.me(mockUser.id)).toStrictEqual(
        passwordDeletedMockUser,
      );
    });
  });
  describe('passwordValid', () => {
    const mockUser = {
      id: 'mock',
      email: 'mockEmail',
      nickname: 'mockNickname',
      password: 'mockpassword',
      role: UserRole.USER,
      type: UserType.BASIC,
    };
    it('유저 아이디와 비밀번호를 인수로 제공하면 비밀번호의 정합여부를 반환한다.', async () => {
      userService.findById = jest.fn().mockResolvedValue(mockUser);
      userService.checkPassword = jest.fn().mockResolvedValue(true);
      expect(
        await userService.passwordValid(mockUser.id, mockUser.password),
      ).toBeTruthy();
    });
  });
  describe('editUser', () => {
    const mockUser = {
      id: 'mock',
      email: 'mockEmail',
      nickname: 'mockNickname',
      password: 'mockpassword',
      role: UserRole.USER,
      type: UserType.BASIC,
    };

    it('변경할 password를 인수로 제공하면 password를 변경한다', async () => {
      const passwordEditUser = {
        ...mockUser,
        password: 'editedPassword',
      };
      userService.findById = jest.fn().mockResolvedValue(mockUser);
      userRepository.update = jest.fn().mockResolvedValue(passwordEditUser);
      expect(
        await userService.editUser(mockUser.id, { password: 'editedPassword' }),
      ).toStrictEqual(passwordEditUser);
    });

    it('변경할 nickname을 인수로 제공하면 nickname을 변경한다', async () => {
      const nicknameEditUser = {
        ...mockUser,
        nickname: 'editedNickname',
      };
      userService.findById = jest.fn().mockResolvedValue(mockUser);
      userRepository.update = jest.fn().mockResolvedValue(nicknameEditUser);
      expect(
        await userService.editUser(mockUser.id, { nickname: 'editedNickname' }),
      ).toStrictEqual(nicknameEditUser);
    });
  });
  describe('deleteUser', () => {
    const mockUser = {
      id: 'mock',
      email: 'mockEmail',
      nickname: 'mockNickname',
      password: 'mockpassword',
      role: UserRole.USER,
      type: UserType.BASIC,
    };
    it('유저를 삭제한다.', async () => {
      userService.findById = jest.fn().mockResolvedValue(mockUser);
      userRepository.delete = jest.fn().mockResolvedValue(mockUser.id);
      expect(await userService.deleteUser(mockUser.id)).toStrictEqual(
        mockUser.id,
      );
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
    const mockNewAccessToken = 'mockNewAccessToken';

    it('refresh token이 유효하면 새 access token을 반환한다.', async () => {
      const verifyUserData = { ...mockUser };
      Reflect.deleteProperty(verifyUserData, 'password');

      userService.findById = jest.fn().mockResolvedValue(mockUser);
      jwtService.refreshVerify = jest.fn().mockReturnValue(verifyUserData);
      jwtService.sign = jest.fn().mockReturnValue(mockNewAccessToken);

      expect(await userService.refresh(mockRefreshToken)).toStrictEqual(
        mockNewAccessToken,
      );
    });
  });
  describe('googleOauth', () => {
    const mockUserForm = {
      email: 'mockOauthEmail',
      password: 'mockOauthId',
      role: UserRole.USER,
      type: UserType.GOOGLE,
    };
    const mockCreatedUser = {
      ...mockUserForm,
      id: 'createdUserId',
      nickname: 'createdUserNickname',
    };
    const mockFindUser = {
      ...mockUserForm,
      id: 'findedUserId',
      nickname: 'findedUserNickname',
    };
    const mockGoogleOauthData = {
      data: {
        id: 'mockGoogleOauthId',
        email: 'mockGoogleOauthEmail',
      },
    };
    const mockAccessToken = 'mockAccessToken';
    const mockRefreshToken = 'mockRefreshToken';
    it('등록된 google oauth 유저면 저장된 유저데이터, access token, refresh token을 반환한다.', async () => {
      userService['getGoogleUserData'] = jest
        .fn()
        .mockResolvedValue(mockGoogleOauthData);
      userService['setGoogleUserForm'] = jest
        .fn()
        .mockResolvedValue(mockUserForm);
      userService.findByEmail = jest.fn().mockResolvedValue(mockFindUser);

      jwtService.refresh = jest.fn().mockReturnValue(mockRefreshToken);
      jwtService.sign = jest.fn().mockReturnValue(mockAccessToken);

      Reflect.deleteProperty(mockFindUser, 'password');
      expect(await userService.googleOauth(mockAccessToken)).toStrictEqual({
        propertyDeletedUser: mockFindUser,
        jwtAccessToken: mockAccessToken,
        jwtRefreshToken: mockRefreshToken,
      });
    });

    it('등록되지 않은 google oauth 유저면 유저 정보를 생성하고 유저데이터, access token, refresh token을 반환한다.', async () => {
      userService['getGoogleUserData'] = jest
        .fn()
        .mockResolvedValue(mockGoogleOauthData);
      userService['setGoogleUserForm'] = jest
        .fn()
        .mockResolvedValue(mockUserForm);
      userService.createUser = jest.fn().mockResolvedValue(mockCreatedUser);
      userService.findByEmail = jest.fn().mockResolvedValue(null);

      jwtService.refresh = jest.fn().mockReturnValue(mockRefreshToken);
      jwtService.sign = jest.fn().mockReturnValue(mockAccessToken);

      Reflect.deleteProperty(mockCreatedUser, 'password');
      expect(await userService.googleOauth(mockAccessToken)).toStrictEqual({
        propertyDeletedUser: mockCreatedUser,
        jwtAccessToken: mockAccessToken,
        jwtRefreshToken: mockRefreshToken,
      });
    });
  });
  describe('getGoogleUserData', () => {
    const mockGoogleOauthData = {
      id: 'mockGoogleOauthId',
      email: 'mockGoogleOauthEmail',
    };

    it('oauth에 유저 정보가 없을 경우 HttpException을 반환한다.', async () => {
      const mockAccessToken = 'mockAccessToken';
      httpService.axiosRef.get = jest.fn().mockResolvedValue(undefined);

      await expect(async () => {
        await userService['getGoogleUserData'](mockAccessToken);
      }).rejects.toThrowError(
        new HttpException(
          'Google OAuth get user info fail',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('oauth에 액세스토큰으로 유저 정보를 요청시 oauth 유저 정보를 반환한다.', async () => {
      const mockAccessToken = 'mockAccessToken';
      httpService.axiosRef.get = jest
        .fn()
        .mockResolvedValue(mockGoogleOauthData);

      expect(
        await userService['getGoogleUserData'](mockAccessToken),
      ).toStrictEqual(mockGoogleOauthData);
    });
  });
  describe('setGoogleUserForm', () => {
    const inputParam = {
      id: 'mock',
      email: 'mockEmail',
    };
    const mockUserForm = {
      email: inputParam.email,
      password: inputParam.id,
      role: UserRole.USER,
      type: UserType.GOOGLE,
    };
    it('google 유저 정보를 인수로 받으면 이메일과 비밀번호를 가공한 유저정보를 반환한다.', () => {
      expect(userService['setGoogleUserForm'](inputParam)).toStrictEqual(
        mockUserForm,
      );
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
