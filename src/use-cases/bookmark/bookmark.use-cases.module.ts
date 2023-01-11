import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { BookmarkFactoryService } from './bookmark.factory.service';
import { BookmarkUseCases } from './bookmark.use-case';

@Module({
    imports: [DataServicesModule],
    providers: [BookmarkFactoryService, BookmarkUseCases],
    exports: [BookmarkFactoryService, BookmarkUseCases]
})
export class BookmarkUsecasesModule { }
