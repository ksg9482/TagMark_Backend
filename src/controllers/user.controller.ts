import { Body, Controller, Delete, Get, Headers, Patch, Post, ValidationPipe } from "@nestjs/common";
import { AuthUser } from "src/auth/auth-user.decorator";
import { CreateUserDto, CreateUserResponseDto, DeleteUserResponseDto, EditUserDto, EditUserResponseDto, GoogleOauthDto, GoogleOauthResponseDto, LoginDto, LoginResponseDto } from "src/core/dtos";
import { RefreshTokenResponseDto } from "src/core/dtos/user/refresh.dto";
import { UserFactoryService, UserUseCases } from "src/use-cases/user";

@Controller('api/user')
export class UserController {
    constructor(
        private userUseCases: UserUseCases,
        private userFactoryService: UserFactoryService
    ) { };

    @Get('/')
    async findAllUser() {
        try {

            //return this.userUseCases.getAllUsers()
        } catch (error) {
            return error;
        }
    };

    @Post('/')
    async createUser(
        @Body() userDto: CreateUserDto
    ): Promise<CreateUserResponseDto> {
        const createUserResponse = new CreateUserResponseDto();
        try {
            const user = this.userFactoryService.createNewUser(userDto);
            const createdUser = await this.userUseCases.createUser(user);

            createUserResponse.success = true;
            createUserResponse.createdUser = createdUser;

        } catch (error) {
            console.log(error)
            createUserResponse.success = false;
        }

        return createUserResponse;
    };

    @Post('/login')
    async login(
        @Body(new ValidationPipe()) loginDto: LoginDto
    ): Promise<LoginResponseDto> {
        const loginResponse = new LoginResponseDto();
        try {
            const {user, accessToken, refreshToken} = await this.userUseCases.login(loginDto);

            loginResponse.success = true;
            loginResponse.user = user;
            loginResponse.accessToken = accessToken;
            //이건 쿠키로 넣던가 안줘야함
            //loginResponse.refreshToken = refreshToken;
        } catch (error) {
            //로거로 로깅
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
        try {
            const editUser = await this.userUseCases.editUser(userId, editUserDto);
            console.log(editUser)
            editUserResponse.success = true;
            editUserResponse.message = 'updated';
        } catch (error) {
            console.log(error)
            editUserResponse.success = false;
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
            deleteUserResponse.success = false;
        };
        return deleteUserResponse;
    };

    //auth로 이동
    //쿠키에서 꺼내거나 DB비교
    @Get('/refresh')
    async refresh(
        @Headers('accessToken') oldAccessToken: string
    ): Promise<RefreshTokenResponseDto> {
        const refreshTokenResponse = new RefreshTokenResponseDto();
        try {
            const newAccessToken = await this.userUseCases.refresh(oldAccessToken);

            refreshTokenResponse.success = true;
            refreshTokenResponse.accessToken = newAccessToken;
        } catch (error) {
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
            googleOauthResponse.success = false;
        }
        return googleOauthResponse;
    };
}