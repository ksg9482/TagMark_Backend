import { BadRequestException, Body, Controller, InternalServerErrorException, Post, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginInputDto } from './dtos/login.dto';
import { SignUpInputDto } from './dtos/sign-up.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
export class UsersController {
    constructor(private readonly usersService: UsersService){};

    @Post('/')
    @ApiOperation({ summary: '유저 생성 API', description: '유저를 생성한다.' })
    @ApiCreatedResponse({ description: '유저를 생성한다.', type: User })
    @ApiBadRequestResponse({description:'전송된 파라미터 양식이 옳지 않음'})
    async signup(
        @Body(new ValidationPipe()) signUpInputDto:SignUpInputDto
        ){
        try {
            const {user} = await this.usersService.createAccount(signUpInputDto.email, signUpInputDto.password, signUpInputDto.nickname)
            return user
        } catch (error) {
            const error400 = ['Email is aleady exist'];
            if(error400.includes(error.message)) {
                throw new BadRequestException(error.message);
            }
            throw new InternalServerErrorException();
        }
        
    }

    @Post('/login')
    @ApiOperation({ summary: '유저 로그인 API', description: '로그인 한다.' })
    @ApiCreatedResponse({ description: '유저 데이터와 토큰을 반환한다.', type: User })
    @ApiBadRequestResponse({description:'전송된 파라미터 양식이 옳지 않음'})
    async login(
        @Body(new ValidationPipe()) loginInputDto:LoginInputDto
        ) {
        try {
            const {user, token} = await this.usersService.login(loginInputDto.email, loginInputDto.password)
            return {user, token}
        } catch (error) {
            const error400 = ['User not found', 'Wrong password'];
            if(error400.includes(error.message)) {
                throw new BadRequestException(error.message);
            }
            throw new InternalServerErrorException();
        }
    }
}
