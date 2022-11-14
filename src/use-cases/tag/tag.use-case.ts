import { DataServices } from "src/core/abstracts";
import { User } from "src/core/entities";


export class TagUseCases {
    constructor(
        private dataService: DataServices,
    ) {}

    async createUser(user: User):Promise<User> {
        try {
            const createdUser = await this.dataService.users.create(user);
            return createdUser
        } catch (error) {
            throw error;
        }
    }

    getUserById(id:any): Promise<User> {
        return this.dataService.users.get(id);
    }
}