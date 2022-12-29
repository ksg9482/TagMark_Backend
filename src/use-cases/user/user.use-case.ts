import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Inject, Injectable, Logger, LoggerService } from "@nestjs/common";
import { DataServices } from "src/core/abstracts";
import { CreateUserDto, CreateUserResponseDto, EditUserDto, LoginDto } from "src/controllers/dtos";
import { User, UserRole, UserType } from "src/core/entities";
import { JwtService } from "src/jwt/jwt.service";
import { UtilsService } from "src/utils/utils.service";

@Injectable()
export class UserUseCases {
    constructor(
        @Inject(DataServices) //상속을 시키든 주입을 하든 해야하는데 아무것도 없으면 서비스는 당연히 undefined나온다. 왜? 참조할게 없으니까. 
        private readonly dataServices: DataServices, //데이터서비스부터 undefined
        private readonly utilServices: UtilsService,
        private readonly jwtService: JwtService,
        private readonly httpService: HttpService,
        @Inject(Logger) private readonly logger: LoggerService
    ) { };
    
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const {email} = createUserDto
        const user = await this.findByEmail(email);
        if(user){
            this.logger.error('이미 가입된 이메일 입니다.')
            throw new HttpException('이미 가입된 이메일 입니다.', HttpStatus.BAD_REQUEST);
        };

        const createdUser = await this.dataServices.users.create(createUserDto);
        Reflect.deleteProperty(createdUser, "password")
        Reflect.deleteProperty(createdUser, "role")
        Reflect.deleteProperty(createdUser, "createdAt")
        Reflect.deleteProperty(createdUser, "updatedAt")
        return createdUser;
    };

    async login(loginDto:LoginDto) {
        const {email, password} = loginDto;
        const user = await this.findByEmail(email);
        if(!user){
            throw new HttpException('아이디가 없습니다.', HttpStatus.BAD_REQUEST);
        };
        
        if(!await this.checkPassword(password, user)) {
            throw new HttpException('잘못된 비밀번호 입니다.', HttpStatus.BAD_REQUEST);
        }

        Reflect.deleteProperty(user, "password")
        const accessToken = this.jwtService.sign(user);
        const refreshToken = this.jwtService.refresh(user);
        return {user, accessToken, refreshToken}
    };

    async me(userId:number) {
        const user = await this.findById(userId);
        Reflect.deleteProperty(user, "id")
        Reflect.deleteProperty(user, "password")
        Reflect.deleteProperty(user, "role")
        Reflect.deleteProperty(user, "createdAt")
        Reflect.deleteProperty(user, "updatedAt")
        return user
    }
    async passwordValid(userId:number, password: string) {
        const user = await this.findById(userId);
        const result = await this.checkPassword(password, user)
        return result
    }
    

    async editUser(userId:number, editUserDto:EditUserDto) {
        const {changeNickname, changePassword} = editUserDto;
        let user = await this.findById(userId);
        
        if (changeNickname) {
            user.nickname = changeNickname
        }
        if (changePassword) {
            user.password = changePassword
        }
        const userUpadate = await this.dataServices.users.update(userId, user)
        return userUpadate
    };

    async deleteUser(userId:number) {
        const user = await this.findById(userId);

        const deleteUser = await this.dataServices.users.delete(userId);
        return deleteUser
    };

    async refresh(refreshToken: string) {
        const verifyRefreshToken = this.jwtService.refreshVerify(refreshToken);
        if (!verifyRefreshToken) {
            throw new HttpException('Token expire', HttpStatus.BAD_REQUEST);
        };
        
        const user = await this.findById(verifyRefreshToken['id']);
        const newAccessToken = this.jwtService.sign(user);

        return newAccessToken;
    };

    async googleOauth(accessToken: string) {
        const getGoogleUserData = async (accessToken: string) => {
            const getUserInfo = await this.httpService.axiosRef.get(`https://www.googleapis.com/oauth2/v1/userinfo`
            + `?access_token=${accessToken}`)
            if (!getUserInfo) {
                this.logger.error('Google OAuth get user info fail')
              throw new HttpException('Google OAuth get user info fail', HttpStatus.BAD_REQUEST);
            }
            return getUserInfo;
          };
      
          //어뎁터로 빼서 일반화 시키는게??
          const setGoogleUserForm = (userData)=> {
            const userForm = {
              email: userData.email,
              password: userData.id,
              nickname: "익명",
              type: UserType.GOOGLE,
              role: UserRole.USER
            };
            return userForm;
          };
      
          const googleUserInfo = await getGoogleUserData(accessToken);
          const googleUser = setGoogleUserForm(googleUserInfo);
      
          return googleUser;
    };

    protected async findByEmail(email:string):Promise<User> {
        const user = await this.dataServices.users.getByEmail(email)
        return user;
    }

    protected async findById(id:number):Promise<User> {
        const user = await this.dataServices.users.get(id);
        if(!user){
            throw new HttpException('아이디가 없습니다.', HttpStatus.BAD_REQUEST);
        };
        return user;
    };

    private async checkPassword(password: string, user: User):Promise<boolean>{
        return await this.utilServices.checkPassword(password, user);
    };
}