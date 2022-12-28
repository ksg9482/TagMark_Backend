import { Inject, Injectable } from '@nestjs/common';
import * as jwt from "jsonwebtoken";
import { JwtModuleOptions } from './jwt.interfaces';

@Injectable()
export class JwtService {
    constructor(
        @Inject('CONFIG_OPTIONS') 
        private readonly options: JwtModuleOptions,
        ) {}

        //테스트용임. 1일로 바꾸고 리프레시는 7일이여야함
        sign(userData: any): string {
            return jwt.sign(
                {...userData}, 
                this.options.privateKey,
                {expiresIn:'7d',algorithm:'HS256'}
            );
        };

        refresh(userData: any): string {
            const token = jwt.sign(
                {...userData},
                this.options.refreshPrivateKey,
                {expiresIn:'1d', algorithm:'HS256'}
            );
            return token;
        };

        verify(token: string) {
            return jwt.verify(token, this.options.privateKey, {algorithms:['HS256']});
        }

        refreshVerify(token: string) {
            return jwt.verify(token, this.options.refreshPrivateKey, {algorithms:['HS256']});
        }
}
