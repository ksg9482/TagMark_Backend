import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { LoginOutputDto } from './dtos/login.dto';
import { SignUpOutputDto } from './dtos/sign-up.dto';
import { User, UserRole, UserType } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn()
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn()
});

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
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
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const mockUserData: User = {
    id: 1,
    email: '',
    password: '',
    nickname: '',
    role: UserRole.USER,
    type: UserType.BASIC,
    bookmarks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    hashPassword: () => { return new Promise(() => { }) },
    checkPassword: () => { return new Promise(() => { }) }
  };
  
  describe('signup', () => {
    it('회원가입에 성공하면 유저 정보 객체를 반환해야 한다', async () => {
      const signUpOutput: SignUpOutputDto = {
        user: mockUserData
      };

      jest.spyOn(service, 'createAccount').mockResolvedValue(signUpOutput)
      const result = await controller.signup({ email: '', password: '', nickname: '' })
      expect(result).toMatchObject(signUpOutput.user)
    });
  });

  describe('login', () => {
    it('로그인에 성공하면 유저 정보 객체와 토큰을 반환해야 한다', async () => {
      const loginOutput: LoginOutputDto = {
        user: mockUserData,
        token: ''
      };

      jest.spyOn(service, 'login').mockResolvedValue(loginOutput)
      const result = await controller.login({ email: '', password: '' })
      expect(result).toMatchObject(loginOutput)
    });
  });
});
