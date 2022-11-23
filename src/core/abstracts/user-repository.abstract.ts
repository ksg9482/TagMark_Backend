import { User } from "../entities";
import { GenericRepository } from "./generic-repository.abstract";

export abstract class UserRepository extends GenericRepository<User> {
    abstract getByEmail(email: string): Promise<User>;
    abstract create(item: Partial<User>): Promise<User> 
}