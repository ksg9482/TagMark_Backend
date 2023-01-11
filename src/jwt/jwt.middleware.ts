import { Injectable, NestMiddleware } from '@nestjs/common';
import { UserUseCases } from 'src/use-cases/user';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private userUsecases: UserUseCases
  ) { }
  async use(req: any, res: any, next: () => void) {
    if ('jwt' in req.headers) {
      const token = req.headers["jwt"];
      const decoded = this.jwtService.verify(token.toString())
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const user = await this.userUsecases.me(decoded['id']);
        req['user'] = user;
      }
    }
    next();
  }
}
