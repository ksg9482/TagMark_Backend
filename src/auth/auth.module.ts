import { Logger, Module } from '@nestjs/common';
import { JwtModule } from 'src/jwt/jwt.module';
import { UtilsModule } from 'src/utils/utils.module';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule, UtilsModule],
  providers: [AuthService, Logger],
  exports: [AuthService],
})
export class AuthModule {}
