import { UserRole, UserType } from "./entity.interface";


export class User {

    id: number;

    email: string;

    password: string;

    nickname: string;

    role: UserRole

    type: UserType

    createdAt: Date;

    updatedAt: Date;
}