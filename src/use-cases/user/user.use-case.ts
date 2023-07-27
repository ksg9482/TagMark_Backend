import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Inject, Injectable, Logger, LoggerService } from "@nestjs/common";
import { DataServices } from "src/core/abstracts";
import { CreateUserDto, EditUserDto, LoginDto } from "src/controllers/dtos";
import { User, UserRole, UserType } from "src/core/entities";
import { JwtService } from "src/jwt/jwt.service";
import { UtilsService } from "src/utils/utils.service";
import { SocialUserForm } from "../interfaces/user.interface";

type deleteUserProperty = 'default' | 'password';
@Injectable()
export class UserUseCases {
    constructor(
        @Inject(DataServices)
        private readonly dataServices: DataServices,
        private readonly utilServices: UtilsService,
        private readonly jwtService: JwtService,
        private readonly httpService: HttpService,
        @Inject(Logger) private readonly logger: LoggerService
    ) { };

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const { email } = createUserDto;
        const user = await this.findByEmail(email);

        if (user) {
            this.logger.error('Email Already exists.');
            throw new HttpException('Email Already exists.', HttpStatus.BAD_REQUEST);
        };

        const createdUser = await this.dataServices.users.create(createUserDto);
        const propertyDeletedUser = this.deleteUserProperty('default', createdUser);

        return propertyDeletedUser;
    };



    async login(loginDto: LoginDto) {
        const user = await this.findByEmail(loginDto.email);

        if (!user) {
            throw new HttpException('User not exists.', HttpStatus.BAD_REQUEST);
        };
        
        await this.checkPassword(loginDto.password, user);

        const propertyDeletedUser = this.deleteUserProperty('password', user);

        const accessToken = this.jwtService.sign(propertyDeletedUser);
        const refreshToken = this.jwtService.refresh(propertyDeletedUser);

        return { user, accessToken, refreshToken };
    };

    async me(userId: number): Promise<User> {
        const user = await this.findById(userId);
        const propertyDeletedUser = this.deleteUserProperty('default', user);

        return propertyDeletedUser;
    };

    async passwordValid(userId: number, password: string): Promise<boolean> {
        const user = await this.findById(userId);
        const result = await this.checkPassword(password, user);

        return result;
    }


    async editUser(userId: number, editUserDto: EditUserDto): Promise<any> {
        const { changeNickname, changePassword } = editUserDto;
        let user = await this.findById(userId);

        if (changeNickname) {
            user.nickname = changeNickname;
        };
        if (changePassword) {
            user.password = changePassword;
        };

        const userUpadate = await this.dataServices.users.update(userId, user);

        return userUpadate;
    };

    async deleteUser(userId: number): Promise<any> {
        await this.findById(userId);

        const deleteUser = await this.dataServices.users.delete(userId);

        return deleteUser;
    };

    async refresh(refreshToken: string): Promise<string> {
        const verifyRefreshToken:any = this.jwtService.refreshVerify(refreshToken);

        const user = await this.findById(verifyRefreshToken['id']);
        const propertyDeletedUser = this.deleteUserProperty('password', user);
        const newAccessToken = this.jwtService.sign(propertyDeletedUser);

        return newAccessToken;
    };

    async googleOauth(accessToken: string) {
        const googleUserInfo = await this.getGoogleUserData(accessToken);
        const googleUser = this.setGoogleUserForm(googleUserInfo.data);
        let user = await this.findByEmail(googleUser.email);
        if (!user) {
            const createdUser = await this.createUser(googleUser)
            user = createdUser;
        };

        const jwtAccessToken = this.jwtService.sign(user);
        const jwtRefreshToken = this.jwtService.refresh(user);
        const propertyDeletedUser = this.deleteUserProperty('password', user);

        return { propertyDeletedUser, jwtAccessToken, jwtRefreshToken };
    };

    protected async getGoogleUserData(accessToken: string): Promise<any> {
        const getUserInfo = await this.httpService.axiosRef.get(`https://www.googleapis.com/oauth2/v1/userinfo`
            + `?access_token=${accessToken}`);

        if (!getUserInfo) {
            this.logger.error('Google OAuth get user info fail')
            throw new HttpException('Google OAuth get user info fail', HttpStatus.BAD_REQUEST);
        };

        return getUserInfo;
    }

    protected setGoogleUserForm(userData:any): SocialUserForm {
        const userForm = {
            email: userData.email,
            password: userData.id,
            type: UserType.GOOGLE,
            role: UserRole.USER
        };
        return userForm;
    }

    protected async findByEmail(email: string): Promise<User> {
        const user = await this.dataServices.users.getByEmail(email)
        return user;
    }

    protected async findById(id: number): Promise<User> {
        const user = await this.dataServices.users.get(id);
        if (!user) {
            throw new HttpException('User not exists.', HttpStatus.BAD_REQUEST);
        };

        return user;
    };

    protected deleteUserProperty(targetProperty: deleteUserProperty, user: User): User {
        let copyUser: User = this.utilServices.deepCopy(user);

        if (targetProperty === 'default') {
            Reflect.deleteProperty(copyUser, "password")
            Reflect.deleteProperty(copyUser, "role")
            Reflect.deleteProperty(copyUser, "createdAt")
            Reflect.deleteProperty(copyUser, "updatedAt")
        };

        if (targetProperty === 'password') {
            Reflect.deleteProperty(copyUser, "password")
        };

        return copyUser;
    };

    private async checkPassword(password: string, user: User): Promise<boolean> {
        const result = await this.utilServices.checkPassword(password, user);
        if (!result) {
            throw new HttpException('Invalid password.', HttpStatus.BAD_REQUEST);
        }

        return result;
    };
}