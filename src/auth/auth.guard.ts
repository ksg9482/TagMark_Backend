import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { DataServices } from 'src/core';
import { JwtService } from 'src/jwt/jwt.service';
enum AuthorizationType {
  Bearer = 'Bearer'
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataService: DataServices
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const getToken = (req: any) => {
      const authorization = req.headers.authorization.split(' ');
      const type = authorization[0];
      const accessToken = authorization[1];
      if (type === AuthorizationType.Bearer) {
        return accessToken;
      }
    };
    
    try {
      const accessToken = getToken(request);
      if(accessToken) {
        const decoded = this.jwtService.verify(accessToken);
        await this.dataService.users.get(decoded['id'])
        const user  = await this.dataService.users.get(decoded['id'])//await this.usersService.findById(decoded['id']);
        if (!user) {
          return false;
        };
        Reflect.deleteProperty(user, 'password');
        request.userId = user.id;
        return true;
      } else {
        throw false;
      }
    } catch (error) {
      // if(request.method === 'POST' && request.url.split('/')[1] === 'users' && request.url.split('/')[2] === 'login') {
      //   return true;
      // }
      // if(request.method === 'POST' && request.url.split('/')[1] === 'users' && request.url.split('/')[2] === '') {
      //   return true;
      // }
      // const allowMap = {
      //   login:'login',
      //   refresh:'refresh',
      //   google:'google'
      // }
      
      // if(request.url.split('/')[1] === 'users' /*&& allowMap[request.url.split('/')[2]]*/) {
      //   return true;
      // }
      // if(error.name === 'TokenExpiredError') {
      //   throw new Error('expire_token')
      // }
      
      // return false;
      return true;
    }
  }
}
