import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "src/core/dtos";
import { User } from "src/core/entities";

@Injectable()
export class TagFactoryService {
    createNewUser(createUserDto: CreateUserDto) {
        const newUser = new User();
        newUser.email = createUserDto.email;
        newUser.password = createUserDto.password;
        newUser.nickname = createUserDto.nickname;
        newUser.role = createUserDto.role;
        newUser.type = createUserDto.type;

        return newUser;
    }
}