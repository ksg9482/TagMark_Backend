import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PostgresqlDataServicesModule } from 'src/frameworks/data-services/postgresql/postgresql-data-services.module';
import { JwtModule } from 'src/jwt/jwt.module';
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Module({
    imports: [JwtModule, PostgresqlDataServicesModule],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard
        },
        AuthService
    ],
    exports:[AuthService]
})
export class AuthModule { }
