import { Body, Controller, Delete, Get, Headers, Inject, Logger, LoggerService, Patch, Post, Req, Res, ValidationPipe } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthUser } from "src/auth/auth-user.decorator";
import { CreateUserDto, CreateUserResponseDto, DeleteUserResponseDto, EditUserDto, EditUserResponseDto, GoogleOauthDto, GoogleOauthResponseDto, LoginDto, LoginResponseDto } from "src/core/dtos";
import { LogoutResponseDto } from "src/core/dtos/user/logout.dto";
import { PasswordValidDto, PasswordValidResponseDto } from "src/core/dtos/user/password-valid.dto";
import { RefreshTokenResponseDto } from "src/core/dtos/user/refresh.dto";
import { UserProfileResponseDto } from "src/core/dtos/user/user-profile.dto";
import { UserFactoryService, UserUseCases } from "src/use-cases/user";
import { secure } from "src/utils/secure";

@Controller('api/user')
export class UserController {
    constructor(
        private userUseCases: UserUseCases,
        private userFactoryService: UserFactoryService,
        @Inject(Logger) private readonly logger: LoggerService
    ) { };

    @Get('/')
    async findUserData(
        @AuthUser() userId: number
    ): Promise<UserProfileResponseDto> {
        const userProfileResponse = new UserProfileResponseDto();
        try {
            //const secureWrap = secure().wrapper()
            const user = await this.userUseCases.me(userId);
            this.logger.log('유저데이터')
            userProfileResponse.success = true;
            userProfileResponse.user = user//secureWrap.encryptWrapper(JSON.stringify(user));
        } catch (error) {
            this.logger.debug(error)
            userProfileResponse.success = false;
        }
        return userProfileResponse;
    };


    @Post('/')
    async createUser(
        @Body(new ValidationPipe()) userDto: CreateUserDto
    ): Promise<CreateUserResponseDto> {
        //console.log(userDto)
        const createUserResponse = new CreateUserResponseDto();
        try {
            //const secureWrap = secure().wrapper()
            let signupData = {
                ...userDto, 
                //email:secureWrap.decryptWrapper(userDto.email),
                //password:secureWrap.decryptWrapper(userDto.password)
            }
            if(userDto.nickname) {
                signupData = {
                    ...signupData, 
                    //nickname:secureWrap.decryptWrapper(userDto.nickname)
                }
            }
            const user = this.userFactoryService.createNewUser(userDto);
            const createdUser = await this.userUseCases.createUser(user);
            

            createUserResponse.success = true;
            createUserResponse.createdUser = createdUser;

        } catch (error) {
            this.logger.debug(error)
            createUserResponse.success = false;
            createUserResponse.error = error.message
        }

        return createUserResponse;
    };

    @Post('/valid')
    async checkPassword(
        @AuthUser() userId: number,
        @Body(new ValidationPipe()) passwordValidDto: PasswordValidDto
        ) {
            const passwordValidResponse = new PasswordValidResponseDto();
            const {password} = passwordValidDto
            try {
                //const secureWrap = secure().wrapper()
                const createdUser = await this.userUseCases.passwordValid(userId,password/*secureWrap.decryptWrapper(password)*/);
                
    
                passwordValidResponse.success = true;
                passwordValidResponse.valid = createdUser;
    
            } catch (error) {
                this.logger.debug(error)
                passwordValidResponse.success = false;
            }
    
            return passwordValidResponse;
    }

    @Post('/login')
    async login(
        @Body(new ValidationPipe()) loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<LoginResponseDto> {
        const loginResponse = new LoginResponseDto();
        try {
            //const secureWrap = secure().wrapper()
            const loginData = {
                ...loginDto, 
                //email:secureWrap.decryptWrapper(loginDto.email), 
                //password:secureWrap.decryptWrapper(loginDto.password)
            }
            const { user, accessToken, refreshToken } = await this.userUseCases.login(loginDto);
            // const encrytedToken = {
            //     accessToken: secureWrap.encryptWrapper(accessToken),
            //     refreshToken: secureWrap.encryptWrapper(refreshToken)
            // }
            // res.cookie('refreshToken', encrytedToken.refreshToken)
            // res.cookie('accessToken', encrytedToken.accessToken)
            res.cookie('refreshToken', refreshToken)
            res.cookie('accessToken', accessToken)
            loginResponse.success = true;
            loginResponse.user = user//secureWrap.encryptWrapper(JSON.stringify(user));
            loginResponse.accessToken = accessToken//encrytedToken.accessToken;
            //이건 쿠키로 넣던가 안줘야함
            //loginResponse.refreshToken = refreshToken;
        } catch (error) {
            this.logger.debug(error)
            loginResponse.error = error.message
            loginResponse.success = false;
        };
        return loginResponse;
    };

    @Patch('/')
    async editUser(
        @AuthUser() userId: number,
        @Body(new ValidationPipe()) editUserDto: EditUserDto
    ): Promise<EditUserResponseDto> {
        const editUserResponse = new EditUserResponseDto();
        const changePassword = editUserDto.changePassword;
        const changeNickname = editUserDto.changeNickname;
        try {
            //const secureWrap = secure().wrapper()
            let editData = {
                changeNickname:'',
                changePassword:''
            }
            if(changePassword?.length > 0){
                editData['changePassword'] = editUserDto.changePassword//secureWrap.decryptWrapper(editUserDto.changePassword)
            }
            if(changeNickname?.length > 0){
                editData['changeNickname'] = editUserDto.changeNickname//secureWrap.decryptWrapper(editUserDto.changeNickname)
            }
            //console.log(userId, editUserDto)
            const editUser = await this.userUseCases.editUser(userId, editUserDto);
            editUserResponse.success = true;
            editUserResponse.message = 'updated';
        } catch (error) {
            this.logger.debug(error)
            editUserResponse.success = false;
            editUserResponse.error = error.message;
        };
        return editUserResponse;
    };

    @Delete('/')
    async deleteUser(
        @AuthUser() userId: number
    ): Promise<DeleteUserResponseDto> {
        const deleteUserResponse = new DeleteUserResponseDto();
        try {
            const deleteUser = await this.userUseCases.deleteUser(userId);

            deleteUserResponse.success = true;
            deleteUserResponse.message = 'deleted';
        } catch (error) {
            this.logger.debug(error)
            deleteUserResponse.success = false;
        };
        return deleteUserResponse;
    };

    @Get('logout')
    async logOut(
        @AuthUser() userId: number,
        @Res({ passthrough: true }) res: Response
    ): Promise<LogoutResponseDto> {
        const logOutResponse = new LogoutResponseDto();
        try {
            res.clearCookie('refreshToken')
            res.clearCookie('accessToken')
            logOutResponse.success = true
            logOutResponse.message = 'logout'
        } catch (error) {
            this.logger.debug(error)
            logOutResponse.success = false
        }
        return logOutResponse
    }

    //auth로 이동
    //쿠키에서 꺼내거나 DB비교
    @Get('/refresh')
    async refresh(
        @Headers('cookie') cookie: string,
        @Req() req: Request, //cookie parser 안되는지 확인
    ): Promise<RefreshTokenResponseDto> {
        //console.log(req.cookies)
        const refreshTokenResponse = new RefreshTokenResponseDto();
        const refreshToken = cookie.split('=')[1]
        try {
            const newAccessToken = await this.userUseCases.refresh(refreshToken);

            refreshTokenResponse.success = true;
            refreshTokenResponse.accessToken = newAccessToken;
        } catch (error) {
            this.logger.debug(error)
            refreshTokenResponse.error = error.message;
            refreshTokenResponse.success = false;
        }
        return refreshTokenResponse;
    };

    //설정, 검증필요
    @Post('/google')
    async googleOauth(
        @Body() googleOauthDto: GoogleOauthDto
    ): Promise<GoogleOauthResponseDto> {
        const googleOauthResponse = new GoogleOauthResponseDto();
        try {
            //이걸로 만든 유저데이터를 create에 넣는다. 그걸로 로그인
            const googleOauth = await this.userUseCases.googleOauth(googleOauthDto.accessToken);

            googleOauthResponse.success = true;
            googleOauthResponse.user
        } catch (error) {
            this.logger.debug(error)
            googleOauthResponse.success = false;
        }
        return googleOauthResponse;
    };
}