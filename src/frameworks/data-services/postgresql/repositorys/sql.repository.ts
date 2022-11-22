import { User } from "src/core";
import { CustomRepository } from "./user.abstract";
import { UserRepository } from "./user.repository";

export class SqlRepository implements CustomRepository<User> {
    
    async getAll(): Promise<User[]> {
        return 
    }
}