import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserDto, CreateUserResponseDto } from "src/core/dtos";
import { UserFactoryService, UserUseCases } from "src/use-cases/user";

@Controller('api/bookmark')
export class BookmarkController {
    constructor(
        private userUseCases:UserUseCases,
        private userFactoryService:UserFactoryService
    ) {}

    @Post('/')
    async createUser(
        @Body() userDto: CreateUserDto
    ): Promise<any> {
        const createUserResponse = new CreateUserResponseDto();
        try {
            const user = this.userFactoryService.createNewUser(userDto);
            const createdUser = await this.userUseCases.createUser(user);

            createUserResponse.success = true;
            createUserResponse.createdUser = createdUser;

        } catch (error) {
            createUserResponse.success = false;
        }

        return createUserResponse;
    }
}