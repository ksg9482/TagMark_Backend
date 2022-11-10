import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { LoginInputDto, LoginOutputDto } from './dtos/login.dto';
import { SignUpInputDto, SignUpOutputDto } from './dtos/sign-up.dto';
import { UserProfileOutputDto } from './dtos/user-profile.dto';
import { User } from './entities/user.entity';
export interface EditUserInputDto extends Pick<User, 'id' | 'password' | 'nickname'> {}
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

    public async createAccount(signUpInputDto:SignUpInputDto): Promise<SignUpOutputDto> {
        const usercheck = await this.findByEmail(signUpInputDto.email);
        if(usercheck) {
            throw new Error('Email is aleady exist');
        };

        const user = await this.users.save(
            this.users.create({
                email: signUpInputDto.email,
                password: signUpInputDto.password,
                nickname: signUpInputDto.nickname
            })
        );
        const userData = this.deleteProperty(user, 'password');
        return { user: userData }
    }

    public async login(loginInputDto:LoginInputDto):Promise<LoginOutputDto> {
        const user = await this.findByEmail(loginInputDto.email);
        if (!user) {
            throw new Error('User not found');
        };
        
        const checkPassword = await user.checkPassword(loginInputDto.password);
        if(!checkPassword) {
            throw new Error('Wrong password');
        };
        const userData = this.deleteProperty(user, 'password');
        const token = this.jwtService.sign(userData)
        return { user:userData, token }
    }

    public async editUser(editUserInputDto:Partial<EditUserInputDto>) {
        const user = await this.users.findOne({where:{id:editUserInputDto.id}});
        if (!user) {
            throw new Error('User not found');
        };
        const editMap = {
            password: {password: editUserInputDto.password},
            nickname: {nickname: editUserInputDto.nickname},
            passAndNick: {password: editUserInputDto.password, nickname: editUserInputDto.nickname},
        }
        // let key:string = editUserInputDto.password && editUserInputDto.nickname 
        // ? 'passAndNick'
        // : `${editUserInputDto}`
        let key:string;
        if(editUserInputDto.password && editUserInputDto.nickname) {
            key = 'passAndNick'
        } else if (editUserInputDto.password) {
            key = 'password'
        } else {
            key = 'nickname'
        }
        const result = await this.users.update({id:editUserInputDto.id},editMap[key])
        return { result }
    }

    public async deleteUser(id:number) {
        const user = await this.users.findOne({where:{id:id}});
        if (!user) {
            throw new Error('User not found');
        };
        const deleteUser = await this.users.delete({id:id})
        return { deleteUser }
    }

    protected async findByEmail (email: string) {
        return await this.users.findOne({
            where: { email }
        });
    }
    protected deleteProperty (userData:User, property:string | string[]) {
        const deepCopy = (obj) => {
            if (obj instanceof Object) {
                let result = new obj.constructor();
                Object.keys(obj).forEach(k => {
                    result[k] = deepCopy(obj[k]);
                })
                return result;
            }
            else if (obj instanceof Array) {
                let result = obj.map(element => deepCopy(element));
            }
            else return obj;
        }
        const userDataDeepCopy = deepCopy(userData);
        console.log(userDataDeepCopy)
        const userDataCopy:User = JSON.parse(JSON.stringify(userData));
        const propertyArr = Array.isArray(property) ? property : [property];
        for(let property of propertyArr) {
            Reflect.deleteProperty(userDataCopy, property);
        };
        return userDataCopy
    }
}
