import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from 'src/jwt/jwt.service';
import { SecureService } from 'src/utils/secure.service';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';
import { UserRoleEnum } from '../domain/types/userRole';
import { UserTypeEnum } from '../domain/types/userType';
import { UserFactory } from '../domain/user.factory';
import { UserEntity } from '../infra/db/entity/user.entity';
import { UserRepository } from '../infra/db/repository/user.repository';
import { UserUseCases } from './user.use-case';
// import { UserRoleEnum, UserTypeEnum } from '../domain';

describe('bookmark-use-case', () => {
  let userService: UserUseCases;
  let userRepository: UserRepository;
  let userFactory: UserFactory;
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
    const fakeUser = {
      id: 'fake',
      email: 'fakeEmail',
      nickname: 'fakeNickname',
      password: 'fakepassword',
      role: UserRoleEnum.USER,
      type: UserTypeEnum.BASIC,
    };
    it('이미 등록된 유저이면 HttpException을 반환한다.', async () => {
      userService.findByEmail = jest.fn().mockResolvedValue(fakeUser);

      await expect(async () => {
        await userService.createUser(fakeUser.email, fakeUser.password);
      }).rejects.toThrowError(
        new HttpException('Email Already exists.', HttpStatus.BAD_REQUEST),
      );
    });
    it('이미 등록된 유저이면 HttpException을 반환한다.', async () => {
      userService.findByEmail = jest.fn().mockResolvedValue(fakeUser);

      await expect(async () => {
        await userService.createUser(fakeUser.email, fakeUser.password);
      }).rejects.toThrowError(
        new HttpException('Email Already exists.', HttpStatus.BAD_REQUEST),
      );
    });

    it('유저를 생성하고 생성한 유저 객체를 반환한다.', async () => {
      userService.findByEmail = jest.fn().mockResolvedValue(null);
      userRepository.save = jest.fn().mockResolvedValue(fakeUser);
      Reflect.deleteProperty(fakeUser, 'password');
      Reflect.deleteProperty(fakeUser, 'role');
      expect(
        await userService.createUser(fakeUser.email, fakeUser.password),
      ).toStrictEqual({
        id: 'fake',
        email: 'fakeEmail',
        nickname: 'fakeNickname',
        password: 'fakepassword',
        role: UserRoleEnum.USER,
        type: UserTypeEnum.BASIC,
      });
    });
  });
  describe('login', () => {
    const fakeUser = {
      id: 'fake',
      email: 'fakeEmail',
      nickname: 'fakeNickname',
      password: 'fakepassword',
      role: UserRoleEnum.USER,
      type: UserTypeEnum.BASIC,
    };
    const fakeAccessToken = 'fakeAccessToken';
    const fakeRefreshToken = 'fakeRefreshToken';
    it('등록되지 않은 유저일 경우 HttpException을 반환한다.', async () => {
      userService.findByEmail = jest.fn().mockResolvedValue(null);

      await expect(async () => {
        await userService.login(fakeUser.email, fakeUser.password);
      }).rejects.toThrowError(
        new HttpException('User not exists.', HttpStatus.BAD_REQUEST),
      );
    });

    it('로그인에 성공 할 경우 유저 객체와 access token, refresh token을 반환한다.', async () => {
      userService.findByEmail = jest.fn().mockResolvedValue(fakeUser);
      userService.checkPassword = jest.fn().mockResolvedValue(true);

      jwtService.refresh = jest.fn().mockReturnValue(fakeRefreshToken);
      jwtService.sign = jest.fn().mockReturnValue(fakeAccessToken);

      Reflect.deleteProperty(fakeUser, 'password');
      Reflect.deleteProperty(fakeUser, 'role');

      expect(
        await userService.login(fakeUser.email, fakeUser.password),
      ).toStrictEqual({
        user: {
          id: 'fake',
          email: 'fakeEmail',
          nickname: 'fakeNickname',
          password: 'fakepassword',
          role: UserRoleEnum.USER,
          type: UserTypeEnum.BASIC,
        },
        accessToken: 'fakeAccessToken',
        refreshToken: 'fakeRefreshToken',
      });
    });
  });
  describe('me', () => {
    const fakeUser = {
      id: 'fake',
      email: 'fakeEmail',
      nickname: 'fakeNickname',
      password: 'fakepassword',
      role: UserRoleEnum.USER,
      type: UserTypeEnum.BASIC,
    };
    it('password와 role이 프로퍼티가 제거된 유저 객체를 반환한다.', async () => {
      userService.findById = jest.fn().mockResolvedValue(fakeUser);
      expect(await userService.me(fakeUser.id)).toStrictEqual({
        id: 'fake',
        email: 'fakeEmail',
        nickname: 'fakeNickname',
        type: UserTypeEnum.BASIC,
      });
    });
  });
  describe('passwordValid', () => {
    const fakeUser = {
      id: 'fake',
      email: 'fakeEmail',
      nickname: 'fakeNickname',
      password: 'fakepassword',
      role: UserRoleEnum.USER,
      type: UserTypeEnum.BASIC,
    };
    it('유저 아이디와 비밀번호를 인수로 제공하면 비밀번호의 정합여부를 반환한다.', async () => {
      userService.findById = jest.fn().mockResolvedValue(fakeUser);
      userService.checkPassword = jest.fn().mockResolvedValue(true);
      expect(
        await userService.passwordValid(fakeUser.id, fakeUser.password),
      ).toBeTruthy();
    });
  });
  describe('editUser', () => {
    const fakeUser = {
      id: 'fake',
      email: 'fakeEmail',
      nickname: 'fakeNickname',
      password: 'fakepassword',
      role: UserRoleEnum.USER,
      type: UserTypeEnum.BASIC,
    };

    it('변경할 password를 인수로 제공하면 password를 변경한다', async () => {
      const passwordEditUser = {
        ...fakeUser,
        password: 'editedPassword',
      };
      userService.findById = jest.fn().mockResolvedValue(fakeUser);
      userRepository.update = jest.fn().mockResolvedValue(passwordEditUser);
      expect(
        await userService.editUser(fakeUser.id, { password: 'editedPassword' }),
      ).toStrictEqual({
        id: 'fake',
        email: 'fakeEmail',
        nickname: 'fakeNickname',
        password: 'editedPassword',
        role: UserRoleEnum.USER,
        type: UserTypeEnum.BASIC,
      });
    });

    it('변경할 nickname을 인수로 제공하면 nickname을 변경한다', async () => {
      const nicknameEditUser = {
        ...fakeUser,
        nickname: 'editedNickname',
      };
      userService.findById = jest.fn().mockResolvedValue(fakeUser);
      userRepository.update = jest.fn().mockResolvedValue(nicknameEditUser);
      expect(
        await userService.editUser(fakeUser.id, { nickname: 'editedNickname' }),
      ).toStrictEqual({
        nickname: 'editedNickname',
        id: 'fake',
        email: 'fakeEmail',
        password: 'fakepassword',
        role: UserRoleEnum.USER,
        type: UserTypeEnum.BASIC,
      });
    });
  });
  describe('deleteUser', () => {
    const fakeUser = {
      id: 'fake',
      email: 'fakeEmail',
      nickname: 'fakeNickname',
      password: 'fakepassword',
      role: UserRoleEnum.USER,
      type: UserTypeEnum.BASIC,
    };
    it('유저를 삭제한다.', async () => {
      userService.findById = jest.fn().mockResolvedValue(fakeUser);
      userRepository.delete = jest.fn().mockResolvedValue(fakeUser.id);
      expect(await userService.deleteUser(fakeUser.id)).toStrictEqual('fake');
    });
  });
  describe('refresh', () => {
    const fakeUser = {
      id: 'fake',
      email: 'fakeEmail',
      nickname: 'fakeNickname',
      password: 'fakepassword',
      role: UserRoleEnum.USER,
      type: UserTypeEnum.BASIC,
    };
    const fakeRefreshToken = 'fakeRefreshToken';
    const fakeNewAccessToken = 'fakeNewAccessToken';

    it('refresh token이 유효하면 새 access token을 반환한다.', async () => {
      const verifyUserData = { ...fakeUser };
      Reflect.deleteProperty(verifyUserData, 'password');

      userService.findById = jest.fn().mockResolvedValue(fakeUser);
      jwtService.refreshVerify = jest.fn().mockReturnValue(verifyUserData);
      jwtService.sign = jest.fn().mockReturnValue(fakeNewAccessToken);

      expect(await userService.refresh(fakeRefreshToken)).toStrictEqual(
        'fakeNewAccessToken',
      );
    });
  });
  describe('googleOauth', () => {
    const fakeUserForm = {
      email: 'fakeOauthEmail',
      password: 'fakeOauthId',
      role: UserRoleEnum.USER,
      type: UserTypeEnum.GOOGLE,
    };
    const fakeCreatedUser = {
      ...fakeUserForm,
      id: 'createdUserId',
      nickname: 'createdUserNickname',
    };
    const fakeFindUser = {
      ...fakeUserForm,
      id: 'findedUserId',
      nickname: 'findedUserNickname',
    };
    const fakeGoogleOauthData = {
      data: {
        id: 'fakeGoogleOauthId',
        email: 'fakeGoogleOauthEmail',
      },
    };
    const fakeAccessToken = 'fakeAccessToken';
    const fakeRefreshToken = 'fakeRefreshToken';
    it('등록된 google oauth 유저면 저장된 유저데이터, access token, refresh token을 반환한다.', async () => {
      userService['getGoogleUserData'] = jest
        .fn()
        .mockResolvedValue(fakeGoogleOauthData);
      userService['setGoogleUserForm'] = jest
        .fn()
        .mockResolvedValue(fakeUserForm);
      userService.findByEmail = jest.fn().mockResolvedValue(fakeFindUser);

      jwtService.refresh = jest.fn().mockReturnValue(fakeRefreshToken);
      jwtService.sign = jest.fn().mockReturnValue(fakeAccessToken);

      Reflect.deleteProperty(fakeFindUser, 'password');
      expect(await userService.googleOauth(fakeAccessToken)).toStrictEqual({
        propertyDeletedUser: {
          id: 'findedUserId',
          nickname: 'findedUserNickname',
          email: 'fakeOauthEmail',
          password: 'fakeOauthId',
          role: UserRoleEnum.USER,
          type: UserTypeEnum.GOOGLE,
        },
        jwtAccessToken: 'fakeAccessToken',
        jwtRefreshToken: 'fakeRefreshToken',
      });
    });

    it('등록되지 않은 google oauth 유저면 유저 정보를 생성하고 유저데이터, access token, refresh token을 반환한다.', async () => {
      userService['getGoogleUserData'] = jest
        .fn()
        .mockResolvedValue(fakeGoogleOauthData);
      userService['setGoogleUserForm'] = jest
        .fn()
        .mockResolvedValue(fakeUserForm);
      userService.createUser = jest.fn().mockResolvedValue(fakeCreatedUser);
      userService.findByEmail = jest.fn().mockResolvedValue(null);

      jwtService.refresh = jest.fn().mockReturnValue(fakeRefreshToken);
      jwtService.sign = jest.fn().mockReturnValue(fakeAccessToken);

      Reflect.deleteProperty(fakeCreatedUser, 'password');
      expect(await userService.googleOauth(fakeAccessToken)).toStrictEqual({
        propertyDeletedUser: {
          id: 'findedUserId',
          nickname: 'findedUserNickname',
          email: 'fakeOauthEmail',
          password: 'fakeOauthId',
          role: UserRoleEnum.USER,
          type: UserTypeEnum.GOOGLE,
        },
        jwtAccessToken: 'fakeAccessToken',
        jwtRefreshToken: 'fakeRefreshToken',
      });
    });
  });
  describe('getGoogleUserData', () => {
    const fakeGoogleOauthData = {
      id: 'fakeGoogleOauthId',
      email: 'fakeGoogleOauthEmail',
    };

    it('oauth에 유저 정보가 없을 경우 HttpException을 반환한다.', async () => {
      const fakeAccessToken = 'fakeAccessToken';
      httpService.axiosRef.get = jest.fn().mockResolvedValue(undefined);

      await expect(async () => {
        await userService['getGoogleUserData'](fakeAccessToken);
      }).rejects.toThrowError(
        new HttpException(
          'Google OAuth get user info fail',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('oauth에 액세스토큰으로 유저 정보를 요청시 oauth 유저 정보를 반환한다.', async () => {
      const fakeAccessToken = 'fakeAccessToken';
      httpService.axiosRef.get = jest
        .fn()
        .mockResolvedValue(fakeGoogleOauthData);

      expect(
        await userService['getGoogleUserData'](fakeAccessToken),
      ).toStrictEqual({
        id: 'fakeGoogleOauthId',
        email: 'fakeGoogleOauthEmail',
      });
    });
  });
  describe('setGoogleUserForm', () => {
    const inputParam = {
      id: 'fake',
      email: 'fakeEmail',
    };

    it('google 유저 정보를 인수로 받으면 이메일과 비밀번호를 가공한 유저정보를 반환한다.', () => {
      expect(userService['setGoogleUserForm'](inputParam)).toStrictEqual({
        email: 'fakeEmail',
        password: 'fake',
        role: UserRoleEnum.USER,
        type: UserTypeEnum.GOOGLE,
      });
    });
  });
  describe('findByEmail', () => {
    it('email 검색 결과 해당하는 유저가 없으면 null을 반환한다.', async () => {
      const fakeEmail = 'fakeEmail';

      userRepository.findByEmail = jest.fn().mockResolvedValue(null);

      expect(await userService.findByEmail(fakeEmail)).toBe(null);
    });

    it('email 검색 결과 해당하는 유저가 있으면 user 객체를 반환한다.', async () => {
      const fakeEmail = 'fakeEmail';

      const fakeUser = {
        id: 'fake',
        email: 'fakeEmail',
        nickname: 'fakeNickname',
        password: 'fakepassword',
        role: UserRoleEnum.USER,
        type: UserTypeEnum.BASIC,
      };
      userRepository.findByEmail = jest.fn().mockResolvedValue(fakeUser);

      expect(await userService.findByEmail(fakeEmail)).toStrictEqual({
        id: 'fake',
        email: 'fakeEmail',
        nickname: 'fakeNickname',
        password: 'fakepassword',
        role: UserRoleEnum.USER,
        type: UserTypeEnum.BASIC,
      });
    });
  });
  describe('findById', () => {
    it('id 검색 결과 해당하는 유저가 없으면 HttpException을 반환한다.', async () => {
      const fakeUserId = 'fakeUserId';
      userRepository.get = jest.fn().mockResolvedValue(null);
      await expect(async () => {
        await userService.findById(fakeUserId);
      }).rejects.toThrowError(
        new HttpException('User not exists.', HttpStatus.BAD_REQUEST),
      );
    });

    it('id 검색 결과 해당하는 유저가 있으면 user 객체를 반환한다.', async () => {
      const fakeUserId = 'fakeUserId';

      const fakeUser = {
        id: 'fake',
        email: 'fakeEmail',
        nickname: 'fakeNickname',
        password: 'fakepassword',
        role: UserRoleEnum.USER,
        type: UserTypeEnum.BASIC,
      };
      userRepository.get = jest.fn().mockResolvedValue(fakeUser);

      expect(await userService.findById(fakeUserId)).toStrictEqual({
        id: 'fake',
        email: 'fakeEmail',
        nickname: 'fakeNickname',
        password: 'fakepassword',
        role: UserRoleEnum.USER,
        type: UserTypeEnum.BASIC,
      });
    });
  });
  describe('deleteUserProperty', () => {
    const fakeUser = {
      id: 'fake',
      email: 'fakeEmail',
      nickname: 'fakeNickname',
      password: 'fakepassword',
      role: UserRoleEnum.USER,
      type: UserTypeEnum.BASIC,
    };

    it('targetProperty가 default인 경우 password와 role이 제거된 user 객체를 반환한다.', () => {
      expect(userService.deleteUserProperty('default', fakeUser)).toStrictEqual(
        {
          id: 'fake',
          email: 'fakeEmail',
          nickname: 'fakeNickname',
          type: UserTypeEnum.BASIC,
        },
      );
    });

    it('targetProperty가 password인 경우 password가 제거된 user 객체를 반환한다.', () => {
      expect(
        userService.deleteUserProperty('password', fakeUser),
      ).toStrictEqual({
        id: 'fake',
        email: 'fakeEmail',
        nickname: 'fakeNickname',
        role: UserRoleEnum.USER,
        type: UserTypeEnum.BASIC,
      });
    });
  });
  describe('checkPassword', () => {
    const fakeUser = {
      id: 'fake',
      email: 'fakeEmail',
      nickname: 'fakeNickname',
      password: 'fakepassword',
      role: UserRoleEnum.USER,
      type: UserTypeEnum.BASIC,
    };

    it('잘못된 비밀번호를 입력하면 HttpException을 반환한다.', async () => {
      secureService.checkPassword = jest.fn().mockResolvedValue(false);
      await expect(async () => {
        await userService.checkPassword('fakePassword', fakeUser);
      }).rejects.toThrowError(
        new HttpException('Invalid password.', HttpStatus.BAD_REQUEST),
      );
    });

    it('정상적인 비밀번호를 입력하면 true를 반환한다.', async () => {
      secureService.checkPassword = jest.fn().mockResolvedValue(true);
      expect(
        await userService.checkPassword('fakePassword', fakeUser),
      ).toBeTruthy();
    });
  });
});
