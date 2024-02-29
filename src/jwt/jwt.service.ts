import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/user/domain/user';
import { JwtModuleOptions } from './jwt.interfaces';
type DeletePasswordUser = Omit<User, 'password'>;

@Injectable()
export class JwtService {
  jwtAlgorithm: jwt.Algorithm;
  constructor(
    @Inject('CONFIG_OPTIONS')
    private readonly options: JwtModuleOptions,
  ) {
    this.jwtAlgorithm = 'HS256';
  }

  sign(user: User): string {
    const accessTokenExpireTime = '15m';
    const { id, email, nickname, type } = user;
    const token = jwt.sign(
      { id, email, nickname, type },
      this.options.privateKey,
      {
        expiresIn: accessTokenExpireTime,
        algorithm: this.jwtAlgorithm,
      },
    );
    return token;
  }

  refresh(user: User): string {
    const refreshTokenExpireTime = '7d';
    const { id, email, nickname, type } = user;

    const token = jwt.sign(
      { id, email, nickname, type },
      this.options.refreshPrivateKey,
      {
        expiresIn: refreshTokenExpireTime,
        algorithm: this.jwtAlgorithm,
      },
    );
    return token;
  }

  verify(token: string) {
    try {
      const result = jwt.verify(token, this.options.privateKey, {
        algorithms: [this.jwtAlgorithm],
      }) as DeletePasswordUser;
      return result;
    } catch (error) {
      throw new HttpException('Token expire', HttpStatus.BAD_REQUEST);
    }
  }

  refreshVerify(token: string): DeletePasswordUser {
    const result = jwt.verify(token, this.options.refreshPrivateKey, {
      algorithms: [this.jwtAlgorithm],
    }) as DeletePasswordUser;
    if (!result) {
      throw new HttpException('Token expire', HttpStatus.BAD_REQUEST);
    }
    return result;
  }
}
