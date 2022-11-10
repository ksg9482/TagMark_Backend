import { IsNumber, IsObject } from "class-validator";
import { User } from "../entities/user.entity";

export class UserProfileInputDto {
    @IsNumber()
    userId: number
}

export class UserProfileOutputDto {
    @IsObject()
    user: User;
}