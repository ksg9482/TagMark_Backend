import { Body, Controller, Delete, Get, Headers, HttpException, HttpStatus, Inject, Logger, LoggerService, Patch, Post, Req, Res, ValidationPipe } from "@nestjs/common";
import { ApiBody, ApiCookieAuth, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CookieOptions, Request, Response } from "express";
import { AuthUser } from "src/auth/auth-user.decorator";
import { CreateUserDto, CreateUserResponseDto, DeleteUserResponseDto, EditUserDto, EditUserResponseDto, GoogleOauthDto, GoogleOauthResponseDto, LoginDto, LoginResponseDto } from "src/controllers/dtos";
import { LogoutResponseDto } from "src/controllers/dtos/user/logout.dto";
import { PasswordValidDto, PasswordValidResponseDto } from "src/controllers/dtos/user/password-valid.dto";
import { RefreshTokenResponseDto } from "src/controllers/dtos/user/refresh.dto";
import { UserProfileResponseDto } from "src/controllers/dtos/user/user-profile.dto";
import { UserFactoryService, UserUseCases } from "src/use-cases/user";
import { UtilsService } from "src/utils/utils.service";

const cookieOption:CookieOptions = {
    sameSite: 'none',
    path: '/',
    secure: true,
    httpOnly: true,
}

@ApiTags('User')
@Controller('api/user')
export class UserController {
    constructor(
        private userUseCases: UserUseCases,
        private userFactoryService: UserFactoryService,
        private readonly utilServices: UtilsService,
        @Inject(Logger) private readonly logger: LoggerService
    ) { };

    @ApiOperation({ summary: '유저 데이터 반환 API', description: '유저 정보를 반환한다.' })
    @ApiCreatedResponse({ description: '유저 데이터를 반환한다.', type: UserProfileResponseDto })
    @Get('/')
    async findUserData(
        @AuthUser() userId: number
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
    };

    @ApiOperation({ summary: '유저 생성 API', description: '유저를 생성한다.' })
    @ApiCreatedResponse({ description: '유저를 생성한다.', type: CreateUserResponseDto })
    @ApiBody({ type: CreateUserDto })
    @Post('/')
    async createUser(
        @Body(new ValidationPipe()) userDto: CreateUserDto
    ): Promise<CreateUserResponseDto> {

        const createUserResponse = new CreateUserResponseDto();
        try {
            const secureWrap = this.utilServices.secure().wrapper()
            let signupData = {
                ...userDto,
                email: secureWrap.decryptWrapper(userDto.email),
                password: secureWrap.decryptWrapper(userDto.password)
            }
            if (userDto.nickname) {
                signupData = {
                    ...signupData,
                    nickname: secureWrap.decryptWrapper(userDto.nickname)
                }
            }
            const user = this.userFactoryService.createNewUser(signupData);

            const createdUser = await this.userUseCases.createUser(user);

            createUserResponse.success = true;
            createUserResponse.createdUser = createdUser;
            return createUserResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    };

    @ApiOperation({ summary: '비밀번호의 정합 여부를 확인하는 API', description: '입력한 비밀번호가 DB에 저장된 비밀번호와 동일한지 확인한다.' })
    @ApiCreatedResponse({ description: '정합여부를 boolean으로 반환한다.', type: PasswordValidResponseDto })
    @ApiBody({ type: PasswordValidDto })
    @Post('/valid')
    async checkPassword(
        @AuthUser() userId: number,
        @Body(new ValidationPipe()) passwordValidDto: PasswordValidDto
    ) {
        const passwordValidResponse = new PasswordValidResponseDto();
        const { password } = passwordValidDto
        try {
            const createdUser = await this.userUseCases.passwordValid(userId, password);

            passwordValidResponse.success = true;
            passwordValidResponse.valid = createdUser;
            return passwordValidResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: '유저 로그인 API', description: '로그인 한다.' })
    @ApiCreatedResponse({ description: '유저 데이터와 토큰을 반환한다.', type: LoginResponseDto })
    @ApiBody({ type: LoginDto })
    @Post('/login')
    async login(
        @Body(new ValidationPipe()) loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<LoginResponseDto> {
        const loginResponse = new LoginResponseDto();
        try {
            const secureWrap = this.utilServices.secure().wrapper()
            const loginData = {
                ...loginDto,
                email: secureWrap.decryptWrapper(loginDto.email),
                password: secureWrap.decryptWrapper(loginDto.password)
            }
            const { user, accessToken, refreshToken } = await this.userUseCases.login(loginData);
            const encrytedToken = {
                accessToken: secureWrap.encryptWrapper(accessToken),
                refreshToken: secureWrap.encryptWrapper(refreshToken)
            }
            
            res.cookie('refreshToken', encrytedToken.refreshToken, cookieOption)
            res.cookie('accessToken', encrytedToken.accessToken, cookieOption)
            loginResponse.success = true;
            loginResponse.user = user;
            loginResponse.accessToken = encrytedToken.accessToken;
            return loginResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        };
    };

    @ApiOperation({ summary: '유저 데이터 수정 API', description: '유저 정보를 수정한다.' })
    @ApiCreatedResponse({ description: '데이터를 수정하고 updated 메시지를 반환한다.', type: EditUserResponseDto })
    @ApiBody({ type: EditUserDto })
    @Patch('/')
    async editUser(
        @AuthUser() userId: number,
        @Body(new ValidationPipe()) editUserDto: EditUserDto
    ): Promise<EditUserResponseDto> {
        const editUserResponse = new EditUserResponseDto();
        const changePassword = editUserDto.changePassword;
        const changeNickname = editUserDto.changeNickname;
        try {
            const secureWrap = this.utilServices.secure().wrapper()
            if (changePassword?.length > 0) {
                editUserDto.changePassword = secureWrap.decryptWrapper(editUserDto.changePassword)
            }
            if (changeNickname?.length > 0) {
                editUserDto.changeNickname = secureWrap.decryptWrapper(editUserDto.changeNickname)
            }
            const editUser = await this.userUseCases.editUser(userId, editUserDto);
            editUserResponse.success = true;
            editUserResponse.message = 'updated';
            return editUserResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        };
    };

    @ApiOperation({ summary: '유저 데이터 삭제 API', description: '유저 정보를 삭제한다.' })
    @ApiCreatedResponse({ description: '유저 데이터를 삭제하고 deleted 메시지를 반환한다.', type: DeleteUserResponseDto })
    @Delete('/')
    async deleteUser(
        @AuthUser() userId: number
    ): Promise<DeleteUserResponseDto> {
        const deleteUserResponse = new DeleteUserResponseDto();
        try {
            const deleteUser = await this.userUseCases.deleteUser(userId);

            deleteUserResponse.success = true;
            deleteUserResponse.message = 'deleted';
            return deleteUserResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        };
    };

    @ApiOperation({ summary: '로그아웃 API', description: '로그아웃 한다.' })
    @ApiCreatedResponse({ description: '로그아웃 한다.' })
    @Get('logout')
    async logOut(
        @Res({ passthrough: true }) res: Response
    ): Promise<LogoutResponseDto> {
        const logOutResponse = new LogoutResponseDto();
        try {
            res.clearCookie('refreshToken')
            res.clearCookie('accessToken')
            logOutResponse.success = true
            logOutResponse.message = 'logout'
            return logOutResponse
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @ApiOperation({ summary: '새로운 access token를 발급하는 API', description: 'refresh 토큰을 통해 새로운 access token을 생성한다.' })
    @ApiCreatedResponse({ description: '유저 데이터와 토큰을 반환한다.', type: RefreshTokenResponseDto })
    @Get('/refresh')
    async refresh(
        @Headers('cookie') cookie: string
    ): Promise<RefreshTokenResponseDto> {

        const refreshTokenResponse = new RefreshTokenResponseDto();
        const refreshToken = decodeURIComponent(cookie.split(';')[0].split('=')[1]);

        try {
            const secureWrap = this.utilServices.secure().wrapper()
            const decrypted = secureWrap.decryptWrapper(refreshToken);
            const newAccessToken = await this.userUseCases.refresh(decrypted);

            refreshTokenResponse.success = true;
            refreshTokenResponse.accessToken = newAccessToken;
            return refreshTokenResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    };

    @ApiOperation({ summary: 'Google 소셜 로그인 API', description: '소셜 로그인 한다.' })
    @ApiCreatedResponse({ description: '유저 데이터와 토큰을 반환한다.', type: GoogleOauthResponseDto })
    @ApiBody({ type: GoogleOauthDto })
    @Post('/google')
    async googleOauth(
        @Body() googleOauthDto: GoogleOauthDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<GoogleOauthResponseDto> {
        const googleOauthResponse = new GoogleOauthResponseDto();
        const secureWrap = this.utilServices.secure().wrapper()
        try {
            const { propertyDeletedUser:user, jwtAccessToken, jwtRefreshToken } = await this.userUseCases.googleOauth(googleOauthDto.accessToken);

            const encrytedToken = {
                accessToken: secureWrap.encryptWrapper(jwtAccessToken),
                refreshToken: secureWrap.encryptWrapper(jwtRefreshToken)
            }
            res.cookie('refreshToken', encrytedToken.refreshToken, cookieOption)
            res.cookie('accessToken', encrytedToken.accessToken, cookieOption)

            googleOauthResponse.success = true;
            googleOauthResponse.user = user
            googleOauthResponse.accessToken = encrytedToken.accessToken;
            return googleOauthResponse;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    };
}