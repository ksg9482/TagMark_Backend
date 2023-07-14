import { Logger, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from 'src/jwt/jwt.module';
import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { UserUsecasesModule } from 'src/use-cases/user';
import { UtilsModule } from 'src/utils/utils.module';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule, DataServicesModule, UtilsModule, UserUsecasesModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthService,
    Logger,
  ],
  exports: [AuthService],
})
export class AuthModule {}
