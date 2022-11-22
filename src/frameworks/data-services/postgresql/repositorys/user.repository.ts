import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "../model";
import { CustomRepository } from "./user.abstract";

//@Injectable()
export class UserRepository extends Repository<User> implements CustomRepository<User> {
    async getAll(): Promise<User[]> {
        return await this.find();
    }
} 