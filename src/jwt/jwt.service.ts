import { Inject, Injectable } from '@nestjs/common';
import * as jwt from "jsonwebtoken";
import { JwtModuleOptions } from './jwt.interfaces';

@Injectable()
export class JwtService {
    constructor(
        @Inject('CONFIG_OPTIONS') 
        private readonly options: JwtModuleOptions,
        ) {}

        
        sign(userData: any): string {
            return jwt.sign(
                {...userData}, 
                this.options.privateKey,
                {expiresIn:'15m',algorithm:'HS256'}
            );
        };

        refresh(userData: any): string {
            const token = jwt.sign(
                {...userData},
                this.options.refreshPrivateKey,
                {expiresIn:'7d', algorithm:'HS256'}
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
