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
  RefreshTokenResponseDto,
  UserProfileResponseDto,
} from 'src/user/interface/dto';
import { UserUseCase } from 'src/user/application/user.use-case';
import { SecureService } from 'src/utils/secure.service';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from 'src/auth.guard';
import { ResponseDto } from 'src/common/dto/response.dto';

const cookieOption: CookieOptions = {
  sameSite: 'none',
  path: '/',
  secure: true,
  httpOnly: true,
};

@ApiTags('User')
@Controller('api/users')
export class UserController {
  constructor(
    private userUsecase: UserUseCase,
    private readonly secureService: SecureService,
    @Inject(Logger) private readonly logger: LoggerService,
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
  async findUserData(@AuthUser() userId: string) {
    try {
      const user = await this.userUsecase.me(userId);
      return ResponseDto.OK_WITH({ user: new UserProfileResponseDto(user) });
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
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<ResponseDto<{ id: string }>> {
    try {
      const createdUser = await this.userUsecase.createUser(
        createUserDto.email,
        createUserDto.password,
        createUserDto.nickname,
      );
      return ResponseDto.OK_WITH(new CreateUserResponseDto(createdUser));
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
  ) {
    try {
      const secureWrap = this.secureService.secure().wrapper();
      const { email, password } = loginDto;

      const { accessToken, refreshToken } = await this.userUsecase.login(
        email,
        password,
      );
      const encrytedToken = {
        accessToken: secureWrap.encryptWrapper(accessToken),
        refreshToken: secureWrap.encryptWrapper(refreshToken),
      };

      res.cookie('refreshToken', encrytedToken.refreshToken, cookieOption);
      res.cookie('accessToken', encrytedToken.accessToken, cookieOption);

      return ResponseDto.OK_WITH(
        new LoginResponseDto(encrytedToken.accessToken),
      );
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
  ) {
    try {
      const editUserResult = await this.userUsecase.editUser(
        userId,
        editUserDto,
      );

      const message = 'updated';
      return ResponseDto.OK_WITH(new EditUserResponseDto(message));
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
  ) {
    try {
      const deleteResult = await this.userUsecase.deleteUser(userId);

      const deleteCookies = ['refreshToken', 'accessToken', 'Authorization'];
      for (const cookie of deleteCookies) {
        res.clearCookie(cookie);
      }

      const message = 'deleted';
      return ResponseDto.OK_WITH(new DeleteUserResponseDto(message));
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '로그아웃 API', description: '로그아웃 한다.' })
  @ApiCreatedResponse({ description: '로그아웃 한다.' })
  @Get('logout')
  async logOut(@Res({ passthrough: true }) res: Response) {
    try {
      const deleteCookies = ['refreshToken', 'accessToken', 'Authorization'];
      for (const cookie of deleteCookies) {
        res.clearCookie(cookie);
      }

      return ResponseDto.OK_WITH({
        message: 'logout',
      });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: '새로운 access token를 발급하는 API',
    description: 'refresh 토큰을 통해 새로운 access token을 생성한다.',
  })
  @ApiCreatedResponse({
    description: '유저 데이터와 토큰을 반환한다.',
    type: RefreshTokenResponseDto,
  })
  @Get('/refresh')
  async refresh(@Headers('cookie') cookie: string) {
    const refreshToken = decodeURIComponent(cookie.split(';')[0].split('=')[1]);
    try {
      const secureWrap = this.secureService.secure().wrapper();
      const decrypted = secureWrap.decryptWrapper(refreshToken);
      const newAccessToken = await this.userUsecase.refresh(decrypted);

      return ResponseDto.OK_WITH(new RefreshTokenResponseDto(newAccessToken));
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
  ) {
    const secureWrap = this.secureService.secure().wrapper();
    try {
      const { accessToken, refreshToken } = await this.userUsecase.googleOauth(
        googleOauthDto.accessToken,
      );

      const encrytedToken = {
        accessToken: secureWrap.encryptWrapper(accessToken),
        refreshToken: secureWrap.encryptWrapper(refreshToken),
      };

      res.cookie('refreshToken', encrytedToken.refreshToken, cookieOption);
      res.cookie('accessToken', encrytedToken.accessToken, cookieOption);

      return ResponseDto.OK_WITH(
        new GoogleOauthResponseDto(encrytedToken.accessToken),
      );
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
