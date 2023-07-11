import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Inject,
  LoggerService,
  InternalServerErrorException,
  Logger,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth.guard';
import { UserInfo } from './UserInfo';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/command/create-user.command';
import { LoginCommand } from '../application/command/login.command';
import { VerifyEmailCommand } from '../application/command/verify-email.command';
import { GetUserInfoQuery } from '../application/query/get-user-info.query';
import { CreateUserDto, CreateUserResponseDto } from './dto/create-user.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('users')
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    @Inject(Logger) private readonly logger: LoggerService,
  ) {}

  @Post('/')
  async createUser(
    @Body(new ValidationPipe()) userDto: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    try {
      const { nickname, email, password } = userDto;
      const command = new CreateUserCommand(email, password, nickname);
      return this.commandBus.execute(command);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //이건 구현해야 해서 급하게 만드는거엔 안좋을듯?
  @Post('/email-verify')
  async verifyEmail(@Query() dto: VerifyEmailDto): Promise<string> {
    const { signupVerifyToken } = dto;

    const command = new VerifyEmailCommand(signupVerifyToken);

    return this.commandBus.execute(command);
  }

  @Post('/login')
  async login(@Body() dto: UserLoginDto): Promise<string> {
    const { email, password } = dto;

    const command = new LoginCommand(email, password);

    return this.commandBus.execute(command);
  }

  //글로벌로 주는 것보다 이렇게 주는게 보안 관리하는게 편하겠다
  @UseGuards(AuthGuard)
  @Get(':id')
  async getUserInfo(@Param('id') userId: string): Promise<UserInfo> {
    const getUserInfoQuery = new GetUserInfoQuery(userId);

    return this.queryBus.execute(getUserInfoQuery);
  }
}
