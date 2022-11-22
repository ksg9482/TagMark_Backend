import { Inject } from "@nestjs/common";
import { DataServices } from "src/core/abstracts";
import { User } from "src/core/entities";


export class BookmarkUseCases {
    constructor(
        @Inject(DataServices)
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

    // getUserById(id:any): Promise<User> {
    //     return this.dataService.users.get(id);
    // }
}