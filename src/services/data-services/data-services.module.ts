import { Module } from "@nestjs/common";
import { PostgresqlDataServicesModule } from "src/frameworks/data-services/postgresql/postgresql-data-services.module";

@Module({
  imports: [PostgresqlDataServicesModule],
  exports: [PostgresqlDataServicesModule],
})

export class DataServicesModule { }