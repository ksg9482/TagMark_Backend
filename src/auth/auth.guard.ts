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
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authServices: AuthService,
    @Inject(Logger) private readonly logger: LoggerService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const caseMap = {
        signup: () => {
          return (
            request.method === 'POST' &&
            request.url.split('/')[1] === 'api' &&
            request.url.split('/')[2] === 'user'
          );
        },
        connectionCheck: () => {
          return request.method === 'GET' && request.url.split('/')[1] === '';
        },
      };
      if (caseMap.signup() || caseMap.connectionCheck()) {
        return true;
      }

      const accessToken = this.authServices.getToken(request);
      if (accessToken) {
        const decoded = this.authServices.accessTokenDecode(accessToken);
        const userInfo = await this.authServices.getUserInfo(decoded.getId());
        if (!userInfo) {
          this.logger.error('User not exists.');
          throw false;
        }

        request.userId = userInfo.getId();
        return true;
      } else {
        this.logger.error('Access token not exists.');
        throw false;
      }
    } catch (error) {
      this.logger.error(error);
      if (request.url.split('/')[3] === 'refresh') {
        return true;
      }

      if (error.name === 'TokenExpiredError') {
        throw new HttpException('TokenExpiredError', HttpStatus.BAD_REQUEST);
      }

      this.logger.error('Reject by Auth Guard.');
      return false;
    }
  }
}
