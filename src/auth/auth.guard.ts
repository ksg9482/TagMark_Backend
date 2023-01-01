import { CanActivate, ExecutionContext, Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { Request } from 'express';
import { DataServices } from 'src/core/abstracts';
import { JwtService } from 'src/jwt/jwt.service';
import { UtilsService } from 'src/utils/utils.service';
enum AuthorizationType {
  Bearer = 'Bearer'
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataService: DataServices,
    private readonly utilServices: UtilsService,
    @Inject(Logger) private readonly logger: LoggerService
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const secureWrap = this.utilServices.secure().wrapper()
    const request = context.switchToHttp().getRequest();
    
    const getToken = (req: any) => {
      const authorization = req.headers.authorization?.split(' ');
      if(!authorization) {
        throw new Error('No Access Token')
      }
      const type = authorization[0];
      const accessToken = secureWrap.decryptWrapper(authorization[1]);
      if (type === AuthorizationType.Bearer) {
        return accessToken;
      }
    };
    try {
      const caseMap = {
        signup:()=>{return request.method === 'POST' && request.url.split('/')[1] === 'api' && request.url.split('/')[2] === 'user'}
      }
      if(caseMap.signup()) {
        return true;
      }
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
      this.logger.error(error)
      //console.log(request.body)
      // if(request.method === 'POST' && request.url.split('/')[1] === 'users' && request.url.split('/')[2] === 'login') {
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
