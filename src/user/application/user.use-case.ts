import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { User } from 'src/user/domain';
import { JwtService } from 'src/jwt/jwt.service';
import { UtilsService } from 'src/utils/utils.service';
import { UserRepository } from 'src/user/domain/repository/user.repository';
import { SecureService } from 'src/utils/secure.service';
import { UserRoleEnum } from '../domain/types/userRole';
import { UserType, UserTypeEnum } from '../domain/types/userType';

export abstract class UserUseCase {
  createUser: (
    email: string,
    password: string,
    nickname?: string,
    type?: UserType,
  ) => Promise<Pick<User, 'id'>>;
  login: (
    email: string,
    password: string,
  ) => Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
  me: (userId: string) => Promise<User>;
  passwordValid: (userId: string, password: string) => Promise<boolean>;
  editUser: (
    userId: string,
    editUserData: {
      password?: string;
      nickname?: string;
    },
  ) => Promise<Pick<User, 'id'>>;
  deleteUser: (userId: string) => Promise<Pick<User, 'id'>>;
  refresh: (refreshToken: string) => Promise<string>;
  googleOauth: (accessToken: string) => Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
  findByEmail: (email: string) => Promise<User | null>;
  findById: (id: string) => Promise<User>;
  checkPassword: (password: string, user: User) => Promise<boolean>;
  getGoogleUserData: (accessToken: string) => Promise<any>;
  setGoogleUserForm: (userData: any) => {
    email: any;
    password: any;
    type: 'GOOGLE';
    role: 'USER';
  };
}

@Injectable()
export class UserUseCaseImpl implements UserUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
    private readonly utilService: UtilsService,
    private readonly secureService: SecureService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    @Inject(Logger) private readonly logger: LoggerService,
  ) {}

  async createUser(
    email: string,
    password: string,
    nickname?: string,
    type?: UserType,
  ): Promise<Pick<User, 'id'>> {
    const user = await this.findByEmail(email);

    if (user) {
      this.logger.error('Email Already exists.');
      throw new HttpException('Email Already exists.', HttpStatus.BAD_REQUEST);
    }

    const createdUser = await this.userRepository.save(
      email,
      nickname || '',
      password,
      UserRoleEnum.USER,
      UserTypeEnum.BASIC,
    );
    return { id: createdUser.id };
  }

  async login(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new HttpException('User not exists.', HttpStatus.BAD_REQUEST);
    }

    await this.checkPassword(password, user);

    const accessToken = this.jwtService.sign(user);
    const refreshToken = this.jwtService.refresh(user);

    return { accessToken, refreshToken };
  }

  async me(userId: string) {
    const user = await this.findById(userId);
    return user;
  }

  async passwordValid(userId: string, password: string): Promise<boolean> {
    const user = await this.findById(userId);
    const isValid = await this.checkPassword(password, user);

    return isValid;
  }

  async editUser(
    userId: string,
    editUserData: { password?: string; nickname?: string },
  ): Promise<Pick<User, 'id'>> {
    const { nickname, password } = editUserData;
    const user = await this.findById(userId);
    if (nickname !== undefined) {
      user.updateNickName(nickname);
    }
    if (password !== undefined) {
      user.updatePassword(password);
    }

    await this.userRepository.update(user.id, user);

    return { id: user.id };
  }

  async deleteUser(userId: string): Promise<Pick<User, 'id'>> {
    const user = await this.findById(userId);

    await this.userRepository.delete(user.id);

    return { id: user.id };
  }

  async refresh(refreshToken: string): Promise<string> {
    const verifyRefreshToken: any = this.jwtService.refreshVerify(refreshToken);

    const user = await this.findById(verifyRefreshToken['id']);

    const newAccessToken = this.jwtService.sign(user);

    return newAccessToken;
  }

  async googleOauth(accessToken: string) {
    let jwtAccessToken;
    let jwtRefreshToken;

    const googleUserInfo = await this.getGoogleUserData(accessToken);
    let user = await this.findByEmail(googleUserInfo.email);

    if (user !== null) {
      jwtAccessToken = this.jwtService.sign(user);
      jwtRefreshToken = this.jwtService.refresh(user);

      return {
        accessToken: jwtAccessToken,
        refreshToken: jwtRefreshToken,
      };
    }

    const googleUser = this.setGoogleUserForm(googleUserInfo.data);

    const createdUser = await this.createUser(
      googleUser.email,
      googleUser.password,
      '',
      UserTypeEnum.GOOGLE,
    );

    const createdGoogleUser = User.from({
      id: createdUser.id,
      email: googleUser.email,
      nickname: '',
      password: googleUser.password,
      role: UserRoleEnum.USER,
      type: UserTypeEnum.GOOGLE,
    });

    jwtAccessToken = this.jwtService.sign(createdGoogleUser);
    jwtRefreshToken = this.jwtService.refresh(createdGoogleUser);

    return {
      accessToken: jwtAccessToken,
      refreshToken: jwtRefreshToken,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);

    if (user === null) {
      return null;
    }
    return User.from({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      password: user.password,
      role: user.role,
      type: user.type,
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.get(id);
    if (!user) {
      throw new HttpException('User not exists.', HttpStatus.BAD_REQUEST);
    }

    return new User(
      user.id,
      user.email,
      user.nickname,
      user.password,
      user.role,
      user.type,
    );
  }

  async checkPassword(password: string, user: User): Promise<boolean> {
    const result = await this.secureService.checkPassword(password, user);
    if (!result) {
      throw new HttpException('Invalid password.', HttpStatus.BAD_REQUEST);
    }

    return result;
  }

  async getGoogleUserData(accessToken: string): Promise<any> {
    const getUserInfo = await this.httpService.axiosRef.get(
      `https://www.googleapis.com/oauth2/v1/userinfo` +
        `?access_token=${accessToken}`,
    );

    if (!getUserInfo) {
      this.logger.error('Google OAuth get user info fail');
      throw new HttpException(
        'Google OAuth get user info fail',
        HttpStatus.BAD_REQUEST,
      );
    }

    return getUserInfo;
  }

  setGoogleUserForm(userData: any) {
    const userForm = {
      email: userData.email,
      password: userData.id,
      type: UserTypeEnum.GOOGLE,
      role: UserRoleEnum.USER,
    };
    return userForm;
  }
}
