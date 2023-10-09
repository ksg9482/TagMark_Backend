import {
  CanActivate,
  ExecutionContext,
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

    const accessToken = this.authServices.getToken(request);

    this.authServices.accessTokenDecode(accessToken);

    return true;
  }
}