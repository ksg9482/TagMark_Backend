import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import * as jwt from "jsonwebtoken";
import { User } from 'src/core';
import { JwtModuleOptions } from './jwt.interfaces';
type DeletePasswordUser = Omit<User, 'password'>
@Injectable()
export class JwtService {
    constructor(
        @Inject('CONFIG_OPTIONS')
        private readonly options: JwtModuleOptions,
    ) { }


    sign(userData: User): string {
        const token = jwt.sign(
            { ...userData },
            this.options.privateKey,
            { expiresIn: '15m', algorithm: 'HS256' }
        );
        return token;
    };

    refresh(userData: User): string {
        const token = jwt.sign(
            { ...userData },
            this.options.refreshPrivateKey,
            { expiresIn: '7d', algorithm: 'HS256' }
        );
        return token;
    };

    verify(token: string): DeletePasswordUser {
        const result = jwt.verify(token, this.options.privateKey, { algorithms: ['HS256'] }) as DeletePasswordUser;
        if (!result) {
            throw new HttpException('Token expire', HttpStatus.BAD_REQUEST);
        };
        return result
    }

    refreshVerify(token: string): DeletePasswordUser {
        const result = jwt.verify(token, this.options.refreshPrivateKey, { algorithms: ['HS256'] }) as DeletePasswordUser;
        if (!result) {
            throw new HttpException('Token expire', HttpStatus.BAD_REQUEST);
        };
        return result
    }
}
