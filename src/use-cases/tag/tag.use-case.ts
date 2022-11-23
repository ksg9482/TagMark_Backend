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

    attachTag(userId: number, bookmarkId: number, tags: void) {
        throw new Error("Method not implemented.");
    }
    getTagsByNames(addTag: string[]) {
        throw new Error("Method not implemented.");
    }
    deleteTag(userId: number, bookmarkId: number, deleteTag: number[]): { message: any; deleteCount: any; } | PromiseLike<{ message: any; deleteCount: any; }> {
        throw new Error("Method not implemented.");
    }

    // getUserById(id:any): Promise<User> {
    //     return this.dataService.users.get(id);
    // }
}