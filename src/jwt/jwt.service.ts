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
            return jwt.sign({...userData}, this.options.privateKey)
            
            
        }

        verify(token: string) {
            return jwt.verify(token, this.options.privateKey);
        }
}
