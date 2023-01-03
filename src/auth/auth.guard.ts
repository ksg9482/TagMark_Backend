import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { Request } from 'express';
import { DataServices } from 'src/core/abstracts';
import { JwtService } from 'src/jwt/jwt.service';
import { UtilsService } from 'src/utils/utils.service';
import { winstonLogger } from 'src/utils/winston.logger';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authServices: AuthService,
    @Inject(Logger) private readonly logger: LoggerService
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      // 통과시켜야하는 것 리스트
      const caseMap = {
        signup:()=>{return request.method === 'POST' && request.url.split('/')[1] === 'api' && request.url.split('/')[2] === 'user'}
      };
      if(caseMap.signup()) {
        return true;
      }
      //소셜 로그인도 화이트리스트
      
      //액세스토큰 확인
      
      const accessToken = this.authServices.getToken(request);
      if(accessToken) {
        const decoded = this.authServices.accessTokenDecode(accessToken);
        const userInfo = await this.authServices.getUserInfo(decoded['id']);
        if (!userInfo) {
          this.logger.error('유저 정보가 없습니다.')
          throw false;
        };
        
        request.userId = userInfo.id;
        return true;
      } else {
        this.logger.error('엑세스 토큰이 없습니다.')
        throw false;
      }
    } catch (error) {
      this.logger.error(error)
      if(request.url.split('/')[3] === 'refresh') {
        return true
      }
      //토큰 만료되었으면 리프레시로 다시 보내게
      if(error.name === 'TokenExpiredError') {
        //관건은 토큰만료로 거절했을때 프론트에서 그걸 받아서 리프레시로 요청보내는 거.
        throw new HttpException('TokenExpiredError', HttpStatus.BAD_REQUEST)
      }
      
      //허용 안된건 거절
      this.logger.error('Auth Guard가 접근을 거부했습니다.')
      return false;
    }
  }
}
