import { Inject } from "@nestjs/common";
import { DataServices, } from "src/core/abstracts";
import { CreateUserDto, CreateUserResponseDto, EditUserDto, LoginDto } from "src/core/dtos";
import { User } from "src/core/entities";

export class UserUseCases {
    constructor(
        @Inject(DataServices) //상속을 시키든 주입을 하든 해야하는데 아무것도 없으면 서비스는 당연히 undefined나온다. 왜? 참조할게 없으니까. 
        private dataServices: DataServices, //데이터서비스부터 undefined
    ) { };
    // getAllUsers(): Promise<User[]> {
    //     return this.dataServices.users.getAll()
    // }
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const user = createUserDto;
        const userCheck = await this.findByEmail(user.email);
        if(userCheck){
            throw new Error('이미 가입된 이메일 입니다.');
        };
        const createdUser = await this.dataServices.users.create(user);
        Reflect.deleteProperty(createdUser, "password")
        return createdUser;

    };

    async login(loginDto:LoginDto) {
        const {email, password} = loginDto;
        const user = await this.dataServices.users.getByEmail(email);
        if(!user){
            throw new Error('아이디가 없습니다.');
        };
        if(!this.checkPassword(password)) {
            throw new Error('잘못된 비밀번호 입니다.')
        }
        Reflect.deleteProperty(user, "password")
        const accessToken = 'accessToken';
        const refreshToken = 'refreshToken';
        return {user, accessToken, refreshToken}
    };

    private async checkPassword(password: string):Promise<boolean>{
        //비크립트 비교
        return true
    }

    async editUser(userId:number, editUserDto:EditUserDto) {
        const {changeNickname, changePassword} = editUserDto;
        const user = await this.dataServices.users.get(userId);
        if(!user){
            throw new Error('아이디가 없습니다.');
        };
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
        const user = await this.dataServices.users.get(userId);
        if(!user){
            throw new Error('아이디가 없습니다.');
        };
        const deleteUser = await this.dataServices.users.delete(userId);
        return deleteUser
    };

    async refresh() {

    };

    async googleOauth() {

    };

    protected async findByEmail(email:string):Promise<User> {
        return await this.dataServices.users.getByEmail(email)
    }

    protected async findById(id:number):Promise<User> {
        return await this.dataServices.users.get(id)
    }


    // getUserById(id:any): Promise<User> {
    //     return this.dataServices.users.get(id);
    // }
}