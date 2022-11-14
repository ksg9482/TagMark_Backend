import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { TagFactoryService } from './tag.factory.service';
import { TagUseCases } from './tag.use-case';

@Module({
    imports: [DataServicesModule],
    providers: [TagFactoryService, TagUseCases],
    exports: [TagFactoryService, TagUseCases]
})
export class TagUsecasesModule {}
