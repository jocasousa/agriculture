import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DashboardModule } from '../../src/dashboard/dashboard.module';
import { DashboardService } from '../../src/dashboard/dashboard.service';

import { ProducersModule } from '../../src/producers/producers.module';
import { FarmsModule } from '../../src/farms/farms.module';
import { SeasonsModule } from '../../src/seasons/seasons.module';
import { CultivationModule } from '../../src/cultivation/cultivation.module';
import { Cultivation } from '../../src/cultivation/entities/cultivation.entity';
import { Producer } from '../../src/producers/entities/producer.entity';
import { Farm } from '../../src/farms/entities/farm.entity';
import { Season } from '../../src/seasons/entities/season.entity';

describe('Dashboard Integration (SQLite in-memory)', () => {
  let app: INestApplication;
  let service: DashboardService;
  let ds: DataSource;

  beforeAll(async () => {
    // Build testing module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Producer, Farm, Season, Cultivation],
          synchronize: true,
        }),
        ProducersModule,
        FarmsModule,
        SeasonsModule,
        CultivationModule,
        DashboardModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    ds = moduleFixture.get<DataSource>(DataSource);
    service = moduleFixture.get<DashboardService>(DashboardService);

    // Clean up tables in dependency order
    await ds.getRepository(Cultivation).clear();
    await ds.getRepository(Farm).clear();
    await ds.getRepository(Season).clear();
    await ds.getRepository(Producer).clear();
  });

  afterAll(async () => {
    await ds.destroy();
    await app.close();
  });

  it('should compute summary, by-state, by-crop, and land-use correctly', async () => {
    // Create sample data
    const prodRepo = ds.getRepository(Producer);
    const farmRepo = ds.getRepository(Farm);
    const seasonRepo = ds.getRepository(Season);
    const cultRepo = ds.getRepository(Cultivation);

    const p = await prodRepo.save({ document: '123', name: 'P1' });
    const s1 = await seasonRepo.save({ year: 2025 });
    const f1 = await farmRepo.save({
      name: 'F1',
      city: 'C1',
      state: 'ST',
      totalArea: 100,
      arableArea: 60,
      vegetationArea: 40,
      producer: p,
    });
    await cultRepo.save({ crop: 'Soja', farm: f1, season: s1 });

    const summary = await service.getSummary();
    expect(summary.totalFarms).toBe(1);
    expect(summary.totalArea).toBe(100);

    const byState = await service.getByState();
    expect(byState).toEqual([{ state: 'ST', count: 1 }]);

    const byCrop = await service.getByCrop();
    expect(byCrop).toEqual([{ crop: 'Soja', count: 1 }]);

    const landUse = await service.getLandUse();
    expect(landUse).toEqual({ arable: 60, vegetation: 40 });
  });
});
