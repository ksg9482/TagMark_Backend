import { DataServices } from "src/core/abstracts";
import { User } from "src/core/entities";


export class UserUseCases {
    constructor(
        private dataServices: DataServices,
    ) {}
    getAllUsers(): Promise<User[]> {
        return this.dataServices.users.getAll()
    }
    async createUser(user: User):Promise<User> {
        try {
            console.log(user)
            const createdUser = await this.dataServices.users.create(user);
            console.log(createdUser)
            return createdUser
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    getUserById(id:any): Promise<User> {
        return this.dataServices.users.get(id);
    }
}