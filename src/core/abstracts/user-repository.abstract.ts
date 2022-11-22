import { User } from "../entities";
import { GenericRepository } from "./generic-repository.abstract";

export abstract class UserRepository<T> extends GenericRepository<T> {
    abstract checkPassword(password: string): Promise<boolean>
    abstract getByEmail(email: string): Promise<T>;
}