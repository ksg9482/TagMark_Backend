import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt"
import { User } from "src/core";

@Injectable()
export class UtilsService {
    async checkPassword(password: string, user:User): Promise<boolean> {
        try {
            return await bcrypt.compare(password, user.password)
        } catch (error) {
            console.log(error)
            return false
        }
    }
}