import { DynamicModule, Global, Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { JwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';


@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule { 
    return{ 
        module: JwtModule,
        imports: [UsersModule],
        exports: [JwtService],
        providers: [
          JwtService,
          {
            provide: 'CONFIG_OPTIONS',
            useValue: options
          }
        ]
    }
}
}
