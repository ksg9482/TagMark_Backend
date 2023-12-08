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
import { IUserRepository } from 'src/user/domain/repository/iuser.repository';
import { SecureService } from 'src/utils/secure.service';
import { UserSaveDto } from '../domain/repository/dtos/userSave.dto';
import { UserRole, UserRoleEnum } from '../domain/types/userRole';
import { UserType, UserTypeEnum } from '../domain/types/userType';

type DeleteUserProperty = 'default' | 'password';
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
    type?: UserType,
  ): Promise<Pick<User, 'id'>> {
    const user = await this.findByEmail(email);
    if (user) {
      this.logger.error('Email Already exists.');
      throw new HttpException('Email Already exists.', HttpStatus.BAD_REQUEST);
    }

    const userSaveDto = UserSaveDto.of({
      email,
      password,
      nickname: nickname || '',
      role: UserRoleEnum.USER,
      type: UserTypeEnum.BASIC,
    });

    const createdUser = await this.userRepository.save(userSaveDto);
    // const propertyDeletedUser = this.deleteUserProperty('default', createdUser);

    return { id: createdUser.id };
  }

  async login(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new HttpException('User not exists.', HttpStatus.BAD_REQUEST);
    }
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      type: user.type,
    };
    await this.checkPassword(password, user);
    // const propertyDeletedUser = this.deleteUserProperty('password', user);

    const accessToken = this.jwtService.sign(userWithoutPassword);
    const refreshToken = this.jwtService.refresh(userWithoutPassword);

    // return { user, accessToken, refreshToken };
    return { accessToken, refreshToken };
  }

  async me(userId: string) {
    const user = await this.findById(userId);
    const instance = User.from(user);
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      type: user.type,
    };
    // const propertyDeletedUser = this.deleteUserProperty('default', user);
    return userWithoutPassword;
  }

  async passwordValid(userId: string, password: string): Promise<boolean> {
    const user = await this.findById(userId);
    const result = await this.checkPassword(password, user);

    return result;
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

  async deleteUser(userId: string): Promise<any> {
    await this.findById(userId);

    const deleteUser = await this.userRepository.delete(userId);

    return deleteUser;
  }

  async refresh(refreshToken: string): Promise<string> {
    const verifyRefreshToken: any = this.jwtService.refreshVerify(refreshToken);

    const user = await this.findById(verifyRefreshToken['id']);
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      type: user.type,
    };
    // const propertyDeletedUser = this.deleteUserProperty('password', user);
    const newAccessToken = this.jwtService.sign(userWithoutPassword);

    return newAccessToken;
  }

  async googleOauth(accessToken: string) {
    const googleUserInfo = await this.getGoogleUserData(accessToken);
    let user = await this.findByEmail(googleUserInfo.email);
    if (!user) {
      const googleUser = this.setGoogleUserForm(googleUserInfo.data);

      const createdUser = await this.createUser(
        googleUser.email,
        googleUser.password,
        '',
        UserTypeEnum.GOOGLE,
      );

      user = new User(
        createdUser.id,
        googleUser.email,
        '',
        googleUser.password,
        UserRoleEnum.USER,
        UserTypeEnum.GOOGLE,
      );
    }

    const jwtAccessToken = this.jwtService.sign(user);
    const jwtRefreshToken = this.jwtService.refresh(user);
    // const propertyDeletedUser = this.deleteUserProperty('password', user);

    // return {
    //   user:{
    //     id: user.id,
    //     email: user.email,
    //     nickname: user.nickname,
    //     type: user.type,
    //   },
    //   accessToken:jwtAccessToken,
    //   refreshToken:jwtRefreshToken
    // };
    return {
      accessToken: jwtAccessToken,
      refreshToken: jwtRefreshToken,
    };
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
      type: UserTypeEnum.GOOGLE,
      role: UserRoleEnum.USER,
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

  // deleteUserProperty(targetProperty: DeleteUserProperty, user: User): User {
  //   const copyUser: User = this.utilService.deepCopy(user);

  //   if (targetProperty === 'default') {
  //     Reflect.deleteProperty(copyUser, 'password');
  //     Reflect.deleteProperty(copyUser, 'role');
  //     Reflect.deleteProperty(copyUser, 'createdAt');
  //     Reflect.deleteProperty(copyUser, 'updatedAt');
  //   }

  //   if (targetProperty === 'password') {
  //     Reflect.deleteProperty(copyUser, 'password');
  //   }

  //   return copyUser;
  // }

  async checkPassword(password: string, user: User): Promise<boolean> {
    const result = await this.secureService.checkPassword(password, user);
    if (!result) {
      throw new HttpException('Invalid password.', HttpStatus.BAD_REQUEST);
    }

    return result;
  }
}
