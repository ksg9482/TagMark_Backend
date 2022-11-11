import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { User, UserRole, UserType } from './entities/user.entity';
import { UsersService } from './users.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn()
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn()
});
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

describe('UsersService', () => {
  let service: UsersService;
  let jwtService: JwtService;

  let usersRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository()
        },
        {
          provide: JwtService,
          useValue: mockJwtService()
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    usersRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const mockUserData: User = {
    id: 1,
    email: '',
    password: '',
    nickname: '',
    role: UserRole.USER,
    type: UserType.BASIC,
    bookmarks: [],
    tags:[],
    createdAt: new Date(),
    updatedAt: new Date(),
    hashPassword: () => { return new Promise(() => { }) },
    checkPassword: () => { return new Promise(() => { }) }
  };

  describe('createAccount', () => {
    const createAccountArg = {
      email: '',
      password: '',
      nickname: ''
    }
    it('잘못된 값을 전달하면 실패해야 한다', async () => {
      service['findByEmail'] = jest.fn().mockResolvedValue({
        id: 1,
        email: ''
      })
      try {
        const result = await service.createAccount(createAccountArg);
      } catch (error) {
        expect(error).toEqual(new Error('Email is aleady exist'))
      }
    })

    it('회원가입에 성공하면 유저 정보를 반환해야 한다', async () => {
      service['findByEmail'] = jest.fn().mockResolvedValue(null)
      usersRepository.create.mockReturnValue('ok')
      usersRepository.save.mockResolvedValue(mockUserData)
      //이거 함수화
      const createdAt = mockUserData.createdAt.toISOString();
      const updatedAt = mockUserData.updatedAt.toISOString();
      const outputUser = { ...mockUserData, createdAt: createdAt, updatedAt: updatedAt }
      const deletePropertyArr = ['password', 'checkPassword', 'hashPassword']
      for (let property of deletePropertyArr) {
        Reflect.deleteProperty(outputUser, property)
      }

      const result = await service.createAccount(createAccountArg);
      expect(result).toStrictEqual({ user: outputUser })
    })
  });

  describe('login', () => {
    const loginArg = {
      email: '',
      password: ''
    };
    it('해당하는 이메일이 없으면 실패해야 한다', async () => {
      service['findByEmail'] = jest.fn().mockResolvedValue(undefined);
      try {
        const result = await service.login(loginArg);
      } catch (error) {
        expect(error).toEqual(new Error('User not found'));
      }
    });

    it('비밀번호가 해시된 비밀번호와 동일하지 않으면 실패해야 한다', async () => {
      service['findByEmail'] = jest.fn().mockResolvedValue(mockUserData);
      mockUserData.checkPassword = jest.fn().mockResolvedValue(false);
      try {
        const result = await service.login(loginArg);
      } catch (error) {
        expect(error).toEqual(new Error('Wrong password'));
      }
    });

    it('로그인에 성공하면 유저 정보 객체와 토큰을 반환해야 한다', async () => {
      service['findByEmail'] = jest.fn().mockResolvedValue(mockUserData);
      mockUserData.checkPassword = jest.fn().mockResolvedValue(true);
      const createdAt = mockUserData.createdAt.toISOString();
      const updatedAt = mockUserData.updatedAt.toISOString();
      const loginOutputUser = { ...mockUserData, createdAt: createdAt, updatedAt: updatedAt }
      const deletePropertyArr = ['password', 'checkPassword', 'hashPassword']
      for (let property of deletePropertyArr) {
        Reflect.deleteProperty(loginOutputUser, property)
      }

      const result = await service.login(loginArg);
      expect(result).toStrictEqual({ user: loginOutputUser, token: 'signed-token' })
    })
  });

  describe('findByEmail', () => {
    it('가입되지 않은 이메일을 입력하면 undefined을 반환한다', async () => {
      const result = await service['findByEmail']('undefined@test.com');
      expect(result).toBe(undefined);
    });
  });

  describe('findById', () => {
    it('가입되지 않은 아이디를 입력하면 undefined을 반환한다', async () => {
      usersRepository.findOneBy.mockResolvedValue(null) //null이라 했는데?
      const result = await service.findById(999);
      expect(result).toStrictEqual({ user: null }) //이거 이상함
    })
  })
});
