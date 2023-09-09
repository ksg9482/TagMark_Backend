import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { User, UserRole, UserType } from 'src/user/domain';
import { JwtService } from 'src/jwt/jwt.service';
import { UtilsService } from 'src/utils/utils.service';
import { IUserRepository } from 'src/user/domain/repository/iuser.repository';
import { SecureService } from 'src/utils/secure.service';

type deleteUserProperty = 'default' | 'password';
@Injectable()
export class UserUseCases {
  constructor(
    @Inject('UserRepository') private userRepository: IUserRepository,
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
  ): Promise<User> {
    const user = await this.findByEmail(email);

    if (user) {
      this.logger.error('Email Already exists.');
      throw new HttpException('Email Already exists.', HttpStatus.BAD_REQUEST);
    }
    const tempRole = UserRole.USER;
    const tempType = UserType.BASIC;
    const createdUser = await this.userRepository.save(
      email,
      nickname || '',
      password,
      tempRole,
      tempType,
    );
    const propertyDeletedUser = this.deleteUserProperty('default', createdUser);

    return propertyDeletedUser;
  }

  async login(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new HttpException('User not exists.', HttpStatus.BAD_REQUEST);
    }

    await this.checkPassword(password, user);
    const propertyDeletedUser = this.deleteUserProperty('password', user);

    const accessToken = this.jwtService.sign(propertyDeletedUser);
    const refreshToken = this.jwtService.refresh(propertyDeletedUser);

    return { user, accessToken, refreshToken };
  }

  async me(userId: string): Promise<User> {
    const user = await this.findById(userId);
    const propertyDeletedUser = this.deleteUserProperty('default', user);

    return propertyDeletedUser;
  }

  async passwordValid(userId: string, password: string): Promise<boolean> {
    const user = await this.findById(userId);
    const result = await this.checkPassword(password, user);

    return result;
  }
  //changePassword changeNickname
  async editUser(
    userId: string,
    editUserData: { password?: string; nickname?: string },
  ): Promise<any> {
    const { nickname, password } = editUserData;
    const user = await this.findById(userId);
    if (nickname !== undefined) {
      user.nickname = nickname;
    }
    if (password !== undefined) {
      user.password = password;
    }

    const userUpadate = await this.userRepository.update(userId, user);

    return userUpadate;
  }

  async deleteUser(userId: string): Promise<any> {
    await this.findById(userId);

    const deleteUser = await this.userRepository.delete(userId);

    return deleteUser;
  }

  async refresh(refreshToken: string): Promise<string> {
    const verifyRefreshToken: any = this.jwtService.refreshVerify(refreshToken);

    const user = await this.findById(verifyRefreshToken['id']);
    const propertyDeletedUser = this.deleteUserProperty('password', user);
    const newAccessToken = this.jwtService.sign(propertyDeletedUser);

    return newAccessToken;
  }

  async googleOauth(accessToken: string) {
    const googleUserInfo = await this.getGoogleUserData(accessToken);
    const googleUser = this.setGoogleUserForm(googleUserInfo.data);
    let user = await this.findByEmail(googleUser.email);
    if (!user) {
      const createdUser = await this.createUser(
        googleUser.email,
        googleUser.password,
        '',
      );
      user = createdUser;
    }

    const jwtAccessToken = this.jwtService.sign(user);
    const jwtRefreshToken = this.jwtService.refresh(user);
    const propertyDeletedUser = this.deleteUserProperty('password', user);

    return { propertyDeletedUser, jwtAccessToken, jwtRefreshToken };
  }

  protected async getGoogleUserData(accessToken: string): Promise<any> {
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

  protected setGoogleUserForm(userData: any) {
    const userForm = {
      email: userData.email,
      password: userData.id,
      type: UserType.GOOGLE,
      role: UserRole.USER,
    };
    return userForm;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.get(id);
    if (!user) {
      throw new HttpException('User not exists.', HttpStatus.BAD_REQUEST);
    }

    return user;
  }

  deleteUserProperty(targetProperty: deleteUserProperty, user: User): User {
    const copyUser: User = this.utilService.deepCopy(user);

    if (targetProperty === 'default') {
      Reflect.deleteProperty(copyUser, 'password');
      Reflect.deleteProperty(copyUser, 'role');
      Reflect.deleteProperty(copyUser, 'createdAt');
      Reflect.deleteProperty(copyUser, 'updatedAt');
    }

    if (targetProperty === 'password') {
      Reflect.deleteProperty(copyUser, 'password');
    }

    return copyUser;
  }

  async checkPassword(password: string, user: User): Promise<boolean> {
    const result = await this.secureService.checkPassword(password, user);
    if (!result) {
      throw new HttpException('Invalid password.', HttpStatus.BAD_REQUEST);
    }

    return result;
  }
}
