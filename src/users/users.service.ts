import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { LoginOutputDto } from './dtos/login.dto';
import { SignUpOutputDto } from './dtos/sign-up.dto';
import { UserProfileOutputDto } from './dtos/user-profile.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private readonly jwtService: JwtService
    ) { }

    public async findById(id: number): Promise<UserProfileOutputDto> {
        const user = await this.users.findOneBy({ id });
        return { user }
    }

    public async createAccount(email: string, password: string, nickname: string): Promise<SignUpOutputDto> {
        const usercheck = await this.findByEmail(email);
        if(usercheck) {
            throw new Error('Email is aleady exist');
        };

        const user = await this.users.save(
            this.users.create({
                email: email,
                password: password,
                nickname: nickname
            })
        );
        const userData = this.deleteProperty(user, 'password');
        return { user: userData }
    }

    public async login(email: string, password: string):Promise<LoginOutputDto> {
        const user = await this.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        };
        
        const checkPassword = await user.checkPassword(password);
        if(!checkPassword) {
            throw new Error('Wrong password');
        };
        const userData = this.deleteProperty(user, 'password');
        const token = this.jwtService.sign(userData)
        return { user:userData, token }
    }

    protected async findByEmail (email: string) {
        return await this.users.findOne({
            where: { email }
        });
    }
    protected deleteProperty (userData:User, property:string | string[]) {
        const userDataCopy:User = JSON.parse(JSON.stringify(userData));
        const propertyArr = Array.isArray(property) ? property : [property];
        for(let property of propertyArr) {
            Reflect.deleteProperty(userDataCopy, property);
        };
        return userDataCopy
    }
}
