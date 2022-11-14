export enum UserType {
    BASIC = 'BASIC',
    KAKAO = 'KAKAO',
    GOOGLE = 'GOOGLE'
}
export enum UserRole {
    USER = 'USER',
    MANAGER = 'MANAGER'
}
export class User {

    //id: number;

    email: string;

    password: string;

    nickname: string;

    role: UserRole

    type: UserType

    //createdAt: Date;

    //updatedAt: Date;
}