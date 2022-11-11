import { BadRequestException, Body, Controller, Delete, Get, Headers, InternalServerErrorException, Param, ParseIntPipe, Patch, Post, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { LoginInputDto } from './dtos/login.dto';
import { SignUpInputDto } from './dtos/sign-up.dto';
import { User } from './entities/user.entity';
import { EditUserInputDto, UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { };

    @Post('/')
    @ApiOperation({ summary: '유저 생성 API', description: '유저를 생성한다.' })
    @ApiCreatedResponse({ description: '유저를 생성한다.', type: User })
    @ApiBadRequestResponse({ description: '전송된 파라미터 양식이 옳지 않음' })
    async signup(
        @Body(new ValidationPipe()) signUpInputDto: SignUpInputDto
    ) {
        try {
            const { user } = await this.usersService.createAccount(signUpInputDto)
            return user
        } catch (error) {
            const error400 = ['Email is aleady exist'];
            if (error400.includes(error.message)) {
                throw new BadRequestException(error.message);
            }
            throw new InternalServerErrorException();
        }

    }

    @Post('/login')
    @ApiOperation({ summary: '유저 로그인 API', description: '로그인 한다.' })
    @ApiCreatedResponse({ description: '유저 데이터와 토큰을 반환한다.', type: User })
    @ApiBadRequestResponse({ description: '전송된 파라미터 양식이 옳지 않음' })
    async login(
        @Body(new ValidationPipe()) loginInputDto: LoginInputDto
    ) {
        try {
            const { user, accessToken, refreshToken } = await this.usersService.login(loginInputDto)
            
            return { user, accessToken, refreshToken } 
        } catch (error) {
            const error400 = ['User not found', 'Wrong password'];
            if (error400.includes(error.message)) {
                throw new BadRequestException(error.message);
            }
            throw new InternalServerErrorException();
        }
    }

    @Patch('/')
    async editUser(
        @AuthUser() userId:number,
        @Body(new ValidationPipe()) editUserInputDto: EditUserInputDto
    ) {
        try {
            const result = await this.usersService.editUser(userId, editUserInputDto);
            return result
        } catch (error) {
            const error400 = ['User not found'];
            if (error400.includes(error.message)) {
                throw new BadRequestException(error.message);
            }
            throw new InternalServerErrorException();
        };
    };

    @Delete('/:id')
    async deleteUser(
        @Param('id', ParseIntPipe) id:number
    ) {
        try {
            const result = await this.usersService.deleteUser(id);
            return result
        } catch (error) {
            const error400 = ['User not found'];
            if (error400.includes(error.message)) {
                throw new BadRequestException(error.message);
            }
            throw new InternalServerErrorException();
        }
    }

    @Get('/refresh')
    async refresh(
        @Headers('accessToken') oldAccessToken:string
    ) {
        const accessToken = await this.usersService.refresh(oldAccessToken);
        return {accessToken}
    }

    @Post('/google')
    async googleOauth(
        @Body() accessToken: string
    ) {
        const googleOAuth = await this.usersService.googleOauth(accessToken)
        return {googleOAuth}
    }

}
