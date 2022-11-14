import { Test, TestingModule } from '@nestjs/testing';
import { PostgresqlDataServicesService } from './postgresql-data-services.service';

describe('PostgresqlDataServicesService', () => {
  let service: PostgresqlDataServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostgresqlDataServicesService],
    }).compile();

    service = module.get<PostgresqlDataServicesService>(PostgresqlDataServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
