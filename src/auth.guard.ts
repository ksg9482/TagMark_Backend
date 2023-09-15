import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authServices: AuthService,
    @Inject(Logger) private readonly logger: LoggerService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private validateRequest(request: Request) {
    if (request.headers.authorization === undefined) {
      return false;
    }
    
    // const jwtString = request.headers.authorization.split('Bearer ')[1];
    const accessToken = this.authServices.getToken(request);

    this.authServices.accessTokenDecode(accessToken);

    return true;
  }
  // async canActivate(context: ExecutionContext): Promise<boolean> {
  //   const request = context.switchToHttp().getRequest();
  //   try {
  //     //가드를 필요한 모듈에 별도 적용하는 것이 좋다. 전역으로 하다보니 오히려 알기 힘듦
  //     const caseMap = {
  //       signup: () => {
  //         return (
  //           request.method === 'POST' &&
  //           request.url.split('/')[1] === 'api' &&
  //           request.url.split('/')[2] === 'user'
  //         );
  //       },
  //       connectionCheck: () => {
  //         return request.method === 'GET' && request.url.split('/')[1] === '';
  //       },
  //     };
  //     if (caseMap.signup() || caseMap.connectionCheck()) {
  //       return true;
  //     }

  //     const accessToken = this.authServices.getToken(request);
  //     if (accessToken) {
  //       const decoded = this.authServices.accessTokenDecode(accessToken);
  //       const userInfo = await this.authServices.getUserInfo(decoded.getId());
  //       if (!userInfo) {
  //         this.logger.error('User not exists.');
  //         throw false;
  //       }

  //       request.userId = userInfo.getId();
  //       return true;
  //     } else {
  //       this.logger.error('Access token not exists.');
  //       throw false;
  //     }
  //   } catch (error) {
  //     this.logger.error(error);
  //     if (request.url.split('/')[3] === 'refresh') {
  //       return true;
  //     }

  //     if (error.name === 'TokenExpiredError') {
  //       throw new HttpException('TokenExpiredError', HttpStatus.BAD_REQUEST);
  //     }

  //     this.logger.error('Reject by Auth Guard.');
  //     return false;
  //   }
  // }
}
/**
 * auth, user, jwt를 분리.
 * auth는 user를 가져와서 인증을 하는 것이 아니라, 인증 로직을 제공해 user 컨트롤러에서 인증을 제어하도록 변경.
 * auth와 user가 책임을 제대로 못나누고 자칫 순환 의존성 모습을 갖는 위험이 있었으나 제어 방향을 수정.
 */
