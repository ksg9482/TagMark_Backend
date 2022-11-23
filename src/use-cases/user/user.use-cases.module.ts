import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from 'src/jwt/jwt.module';
import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { UtilsModule } from 'src/utils/utils.module';
import { UserFactoryService } from './user.factory.service';
import { UserUseCases } from './user.use-case';

@Module({
    imports: [DataServicesModule, UtilsModule, HttpModule],
    providers: [UserFactoryService, UserUseCases],
    exports: [UserFactoryService, UserUseCases]
})
export class UserUsecasesModule {}
