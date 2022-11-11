import { Injectable, NestMiddleware } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService
  ) { }
  async use(req: any, res: any, next: () => void) {
    if ('jwt' in req.headers) {
      const token = req.headers["jwt"];
        const decoded = this.jwtService.verify(token.toString())
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          const { user } = await this.userService.findById(decoded['id']);
          req['user'] = user;
        }
    }
    next();
  }
}
