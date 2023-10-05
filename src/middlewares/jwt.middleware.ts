import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { UserUseCases } from 'src/user/application/user.use-case';
import { JwtService } from '../jwt/jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private userUsecases: UserUseCases,
    private authServices: AuthService,
  ) {}
  async use(req: any, res: any, next: () => void) {
    if ('authorization' in req.headers) {
      const accessToken = this.authServices.getToken(req);
      const baseUrlArr = req.baseUrl.split('/')
      if(req.baseUrl.split('/')[baseUrlArr.length - 1] === 'refresh') {
        next();
        return;
      }
      const decoded = this.jwtService.verify(accessToken);
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const user = await this.userUsecases.me(decoded.id);
        req['userId'] = user.id;
      }
    }

    next();
  }
}
