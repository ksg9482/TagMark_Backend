import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  LoggerService,
  Patch,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CookieOptions, Response } from 'express';
import { AuthUser } from 'src/auth/auth-user.decorator';
import {
  CreateUserDto,
  CreateUserResponseDto,
  DeleteUserResponseDto,
  EditUserDto,
  EditUserResponseDto,
  GoogleOauthDto,
  GoogleOauthResponseDto,
  LoginDto,
  LoginResponseDto,
  LogoutResponseDto,
  RefreshTokenResponseDto,
  UserProfileResponseDto,
  PasswordValidDto,
  PasswordValidResponseDto,
} from 'src/user/interface/dto';
import { UserUseCases } from 'src/user/application/user.use-case';
import { UserFactory } from 'src/user/domain/user.factory';
import { SecureService } from 'src/utils/secure.service';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from 'src/auth.guard';
import { WinstonLogger } from 'src/logger/custom.logger.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

const cookieOption: CookieOptions = {
  sameSite: 'none',
  path: '/',
  secure: true,
  httpOnly: true,
};

@ApiTags('User')
@Controller('api/user')
export class UserController {
  constructor(
    private userUseCases: UserUseCases,
    private userFactory: UserFactory,
    private readonly secureService: SecureService,
    @Inject(Logger) private readonly logger: LoggerService,
    // @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
    private authService: AuthService,
  ) {}

  @ApiOperation({
    summary: '유저 데이터 반환 API',
    description: '유저 정보를 반환한다.',
  })
  @ApiCreatedResponse({
    description: '유저 데이터를 반환한다.',
    type: UserProfileResponseDto,
  })
  @Get('/')
  async findUserData(
    @AuthUser() userId: string,
  ): Promise<UserProfileResponseDto> {
    const userProfileResponse = new UserProfileResponseDto();
    try {
      const user = await this.userUseCases.me(userId);

      userProfileResponse.success = true;
      userProfileResponse.user = user;
      return userProfileResponse;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: '유저 생성 API', description: '유저를 생성한다.' })
  @ApiCreatedResponse({
    description: '유저를 생성한다.',
    type: CreateUserResponseDto,
  })
  @ApiBody({ type: CreateUserDto })
  @Post('/')
  async createUser(
    @Body(new ValidationPipe()) userDto: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    const createUserResponse = new CreateUserResponseDto();
    try {
      const { email, password, nickname } = userDto;

      const createdUser = await this.userUseCases.createUser(
        email,
        password,
        nickname,
      );

      createUserResponse.success = true;
      createUserResponse.createdUser = createdUser;
      return createUserResponse;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: '비밀번호의 정합 여부를 확인하는 API',
    description: '입력한 비밀번호가 DB에 저장된 비밀번호와 동일한지 확인한다.',
  })
  @ApiCreatedResponse({
    description: '정합여부를 boolean으로 반환한다.',
    type: PasswordValidResponseDto,
  })
  @ApiBody({ type: PasswordValidDto })
  @Post('/valid')
  async checkPassword(
    @AuthUser() userId: string,
    @Body(new ValidationPipe()) passwordValidDto: PasswordValidDto,
  ) {
    const passwordValidResponse = new PasswordValidResponseDto();
    const { password } = passwordValidDto;
    try {
      const createdUser = await this.userUseCases.passwordValid(
        userId,
        password,
      );

      passwordValidResponse.success = true;
      passwordValidResponse.valid = createdUser;
      return passwordValidResponse;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: '유저 로그인 API', description: '로그인 한다.' })
  @ApiCreatedResponse({
    description: '유저 데이터와 토큰을 반환한다.',
    type: LoginResponseDto,
  })
  @ApiBody({ type: LoginDto })
  @Post('/login')
  async login(
    @Body(new ValidationPipe()) loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const loginResponse = new LoginResponseDto();
    try {
      const secureWrap = this.secureService.secure().wrapper();
      const { email, password } = loginDto;

      //토큰은 tokens 객체로 묶어야 하나?
      const { user, accessToken, refreshToken } = await this.userUseCases.login(
        email,
        password,
      );
      const encrytedToken = {
        accessToken: secureWrap.encryptWrapper(accessToken),
        refreshToken: secureWrap.encryptWrapper(refreshToken),
      };

      res.cookie('refreshToken', encrytedToken.refreshToken, cookieOption);
      res.cookie('accessToken', encrytedToken.accessToken, cookieOption);

      loginResponse.success = true;
      loginResponse.user = user;
      loginResponse.accessToken = encrytedToken.accessToken;
      return loginResponse;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '유저 데이터 수정 API',
    description: '유저 정보를 수정한다.',
  })
  @ApiCreatedResponse({
    description: '데이터를 수정하고 updated 메시지를 반환한다.',
    type: EditUserResponseDto,
  })
  @ApiBody({ type: EditUserDto })
  @Patch('/')
  async editUser(
    @AuthUser() userId: string,
    @Body(new ValidationPipe()) editUserDto: EditUserDto,
  ): Promise<EditUserResponseDto> {
    const editUserResponse = new EditUserResponseDto();
    try {
      await this.userUseCases.editUser(userId, editUserDto);
      editUserResponse.success = true;
      editUserResponse.message = 'updated';
      return editUserResponse;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '유저 데이터 삭제 API',
    description: '유저 정보를 삭제한다.',
  })
  @ApiCreatedResponse({
    description: '유저 데이터를 삭제하고 deleted 메시지를 반환한다.',
    type: DeleteUserResponseDto,
  })
  @Delete('/')
  async deleteUser(
    @AuthUser() userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<DeleteUserResponseDto> {
    const deleteUserResponse = new DeleteUserResponseDto();
    try {
      const deleteUser = await this.userUseCases.deleteUser(userId);
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');
      res.clearCookie('Authorization');
      deleteUserResponse.success = true;
      deleteUserResponse.message = 'deleted';
      return deleteUserResponse;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '로그아웃 API', description: '로그아웃 한다.' })
  @ApiCreatedResponse({ description: '로그아웃 한다.' })
  @Get('logout')
  async logOut(
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    const logOutResponse = new LogoutResponseDto();
    try {
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');
      res.clearCookie('Authorization');
      logOutResponse.success = true;
      logOutResponse.message = 'logout';
      return logOutResponse;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '새로운 access token를 발급하는 API',
    description: 'refresh 토큰을 통해 새로운 access token을 생성한다.',
  })
  @ApiCreatedResponse({
    description: '유저 데이터와 토큰을 반환한다.',
    type: RefreshTokenResponseDto,
  })
  @Get('/refresh')
  async refresh(
    @Headers('cookie') cookie: string,
  ): Promise<RefreshTokenResponseDto> {
    const refreshTokenResponse = new RefreshTokenResponseDto();
    const refreshToken = decodeURIComponent(cookie.split(';')[0].split('=')[1]);

    try {
      const secureWrap = this.secureService.secure().wrapper();
      const decrypted = secureWrap.decryptWrapper(refreshToken);
      const newAccessToken = await this.userUseCases.refresh(decrypted);

      refreshTokenResponse.success = true;
      refreshTokenResponse.accessToken = newAccessToken;
      return refreshTokenResponse;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: 'Google 소셜 로그인 API',
    description: '소셜 로그인 한다.',
  })
  @ApiCreatedResponse({
    description: '유저 데이터와 토큰을 반환한다.',
    type: GoogleOauthResponseDto,
  })
  @ApiBody({ type: GoogleOauthDto })
  @Post('/google')
  async googleOauth(
    @Body() googleOauthDto: GoogleOauthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GoogleOauthResponseDto> {
    const googleOauthResponse = new GoogleOauthResponseDto();
    const secureWrap = this.secureService.secure().wrapper();
    try {
      const {
        propertyDeletedUser: user,
        jwtAccessToken,
        jwtRefreshToken,
      } = await this.userUseCases.googleOauth(googleOauthDto.accessToken);

      const encrytedToken = {
        accessToken: secureWrap.encryptWrapper(jwtAccessToken),
        refreshToken: secureWrap.encryptWrapper(jwtRefreshToken),
      };
      res.cookie('refreshToken', encrytedToken.refreshToken, cookieOption);
      res.cookie('accessToken', encrytedToken.accessToken, cookieOption);

      googleOauthResponse.success = true;
      googleOauthResponse.user = user;
      googleOauthResponse.accessToken = encrytedToken.accessToken;
      return googleOauthResponse;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
