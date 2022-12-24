import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from 'src/jwt/jwt.module';
import { DataServicesModule } from 'src/services/data-services/data-services.module';
//import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Module({
    imports: [JwtModule, DataServicesModule],
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
