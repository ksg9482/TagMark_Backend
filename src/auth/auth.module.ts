import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';

@Module({})
export class AuthModule {
    imports:[UsersModule]
}
