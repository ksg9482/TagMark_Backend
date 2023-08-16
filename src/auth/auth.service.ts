import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from 'src/jwt/jwt.service';
import { UserUseCases } from 'src/user/application/user.use-case';
import { UtilsService } from 'src/utils/utils.service';
import { AuthorizationType } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly utilServices: UtilsService,
    private userUseCases: UserUseCases,
  ) {}
  getToken(req: Request) {
    const secureWrap = this.utilServices.secure().wrapper();
    const authorization = req.headers.authorization?.split(' ');
    if (!authorization) {
      throw new Error('No Access Token');
    }
    const type = authorization[0];
    const accessToken = secureWrap.decryptWrapper(authorization[1]);
    if (type === AuthorizationType.Bearer) {
      return accessToken;
    }
  }

  accessTokenDecode(accessToken: string) {
    const decoded = this.jwtService.verify(accessToken);
    return decoded;
  }

  async getUserInfo(userId: string) {
    const user = await this.userUseCases.me(userId);
    Reflect.deleteProperty(user, 'password');
    return user;
  }
}
