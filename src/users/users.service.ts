import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
//import axios from 'axios';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { LoginInputDto, LoginOutputDto } from './dtos/login.dto';
import { SignUpInputDto, SignUpOutputDto } from './dtos/sign-up.dto';
import { UserProfileOutputDto } from './dtos/user-profile.dto';
import { User } from './entities/user.entity';
export interface EditUserInputDto {
    changePassword: string;
    changeNickname: string
}
@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly httpService: HttpService
    ) { }

    async findById(id: number): Promise<UserProfileOutputDto> {
        const user = await this.users.findOneBy({ id });
        return { user }
    }

    async createAccount(signUpInputDto: Partial<SignUpInputDto>): Promise<SignUpOutputDto> {
        console.log(this.users)
        const usercheck = await this.findByEmail(signUpInputDto.email);
        if (usercheck) {
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

    async login(loginInputDto: LoginInputDto): Promise<LoginOutputDto> {
        const user = await this.users.findOne({
            where: { email: loginInputDto.email },
            select: ['id', 'email', 'password']
        });
        if (!user) {
            throw new Error('User not found');
        };

        const checkPassword = await user.checkPassword(loginInputDto.password);
        if (!checkPassword) {
            throw new Error('Wrong password');
        };

        const userData = this.deleteProperty(user, 'password');
        const accessToken = this.jwtService.sign(userData);
        const refreshToken = this.jwtService.refresh(userData);
        return { user: userData, accessToken, refreshToken }
    }

    async editUser(userId: number, editUserInputDto: Partial<EditUserInputDto>) {
        //원본 -> 바꿈. 바꿀 바디 필요
        //어차피 가드에서 거른다. user not found가 여기에 필요할까?
        const user = await this.users.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        };
        if (editUserInputDto.changeNickname) {
            user.nickname = editUserInputDto.changeNickname
        }
        if (editUserInputDto.changePassword) {
            user.password = editUserInputDto.changePassword
        }
        const result = await this.users.save(user);
        return { result }
        // const editMap = {
        //     password: {password: editUserInputDto.changePassword},
        //     nickname: {nickname: editUserInputDto.changeNickname},
        //     passAndNick: {password: editUserInputDto.changePassword, nickname: editUserInputDto.changeNickname},
        // }
        // // let key:string = editUserInputDto.password && editUserInputDto.nickname 
        // // ? 'passAndNick'
        // // : `${editUserInputDto}`
        // let key:string;
        // if(editUserInputDto.changePassword && editUserInputDto.changeNickname) {
        //     key = 'passAndNick'
        // } else if (editUserInputDto.changePassword) {
        //     key = 'password'
        // } else {
        //     key = 'nickname'
        // }
        //const result = await this.users.update({id:userId},editMap[key])
        //return { result }
    }

    async deleteUser(id: number) {
        const user = await this.users.findOne({ where: { id: id } });
        if (!user) {
            throw new Error('User not found');
        };
        const deleteUser = await this.users.delete({ id: id })
        return { deleteUser }
    }

    async refresh(refreshToken: string) {
        const verifyToken = this.jwtService.verify(refreshToken);
        if (!verifyToken) {
            throw new Error('Token expire');
        };
        const user = await this.users.findOne({ where: { id: verifyToken['id'] } });
        const accessToken = this.jwtService.sign(user);

        return accessToken;
    }

    async googleOauth(accessToken: string) {
        const getGoogleUserData = async (accessToken: string) => {
            const getUserInfo = await this.httpService.axiosRef.get(`https://www.googleapis.com/oauth2/v1/userinfo`
            + `?access_token=${accessToken}`)
            if (!getUserInfo) {
              throw new Error('Google OAuth get user info fail')
            }
            return getUserInfo;
          };
      
          const setGoogleUserForm = (userData)=> {
            const userForm = {
              email: userData.email,
              password: userData.id,
              type: 'google'
            };
            return userForm;
          };
      
          const googleUserInfo = await getGoogleUserData(accessToken);
          const googleUser = setGoogleUserForm(googleUserInfo);
      
          return 'googleUser';
    }

    protected async findByEmail(email: string) {
        return await this.users.findOne({
            where: { email }
        });
    }
    protected deleteProperty(userData: User, property: string | string[]) {
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
        const userDataCopy: User = JSON.parse(JSON.stringify(userData));
         //date를 문자열로 수정해야 함
        const propertyArr = Array.isArray(property) ? property : [property];
        for (let property of propertyArr) {
            Reflect.deleteProperty(userDataCopy, property);
        };
        return userDataCopy
    }
}
