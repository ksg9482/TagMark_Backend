import { DataServices } from "src/core/abstracts";
import { User } from "src/core/entities";


export class UserUseCases {
    constructor(
        private dataServices: DataServices, //데이터서비스부터 undefined
    ) {}
    getAllUsers(): Promise<User[]> {
        return this.dataServices.users.getAll()
    }
    async createUser(user: User):Promise<User> {
        try {
            console.log('유즈케이스',user)
            console.log(this.dataServices)
            const createdUser = await this.dataServices.users.create(user);
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