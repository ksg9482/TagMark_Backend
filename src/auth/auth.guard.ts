import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { DataServices } from 'src/core/abstracts';
import { JwtService } from 'src/jwt/jwt.service';
import { secure } from 'src/utils/secure';
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
    const secureWrap = secure().wrapper()
    const request = context.switchToHttp().getRequest();
    
    const getToken = (req: any) => {
      const authorization = req.headers.authorization.split(' ');
      const type = authorization[0];
      const accessToken = secureWrap.decryptWrapper(authorization[1]);
      if (type === AuthorizationType.Bearer) {
        return accessToken;
      }
    };
    //console.log(request.body)
    try {
      const accessToken = getToken(request);
      if(accessToken) {
        const decoded = this.jwtService.verify(accessToken);
        const user  = await this.dataService.users.get(decoded['id'])
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
      console.log(error)
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
      if(error.name === 'TokenExpiredError') {
        return true;
      }
      
      // return false;
      return true;
    }
  }
}
