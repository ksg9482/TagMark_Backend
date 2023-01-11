import { DynamicModule, Global, Module } from '@nestjs/common';
import { UserUsecasesModule } from 'src/use-cases/user';
import { JwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';


@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      imports: [UserUsecasesModule],
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
