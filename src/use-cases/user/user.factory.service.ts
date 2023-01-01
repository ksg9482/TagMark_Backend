import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "src/controllers/dtos";
import { User } from "src/core/entities";

@Injectable()
export class UserFactoryService {
    createNewUser(createUserDto: CreateUserDto) {
        const newUser = new User();
        newUser.email = createUserDto.email;
        newUser.password = createUserDto.password;
        newUser.nickname = createUserDto.nickname;

        return newUser;
    }
}