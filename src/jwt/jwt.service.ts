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
            return jwt.sign({...userData}, this.options.privateKey,{expiresIn:'10s'})
            
            
        }

        refresh(userData: any): string {
            const token = jwt.sign(
                {
                    id: userData.id,
                },
                this.options.refreshPrivateKey,
                {expiresIn:'1d'}
            );
            return token;
        }

        verify(token: string) {
            return jwt.verify(token, this.options.privateKey);
        }
}
