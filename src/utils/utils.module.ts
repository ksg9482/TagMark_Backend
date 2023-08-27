import { Module } from '@nestjs/common';
import { SecureService } from './secure.service';
import { UtilsService } from './utils.service';

const services = [UtilsService, SecureService];
@Module({
  imports: [],
  providers: [...services],
  exports: [...services],
})
export class UtilsModule {}
