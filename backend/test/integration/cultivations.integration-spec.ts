import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CultivationModule } from '../../src/cultivation/cultivation.module';
import { CultivationService } from '../../src/cultivation/cultivation.service';
import { Producer } from '../../src/producers/entities/producer.entity';
import { Farm } from '../../src/farms/entities/farm.entity';
import { Season } from '../../src/seasons/entities/season.entity';
import { Cultivation } from '../../src/cultivation/entities/cultivation.entity';
import { ProducersModule } from '../../src/producers/producers.module';
import { FarmsModule } from '../../src/farms/farms.module';
import { SeasonsModule } from '../../src/seasons/seasons.module';

describe('Cultivations Integration (SQLite in-memory)', () => {
  let app: INestApplication;
  let service: CultivationService;
  let ds: DataSource;
  let producerId: string;
  let farmId: string;
  let seasonId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    ds = module.get<DataSource>(DataSource);
    service = module.get<CultivationService>(CultivationService);

    const prodRepo = ds.getRepository(Producer);
    const prod = await prodRepo.save({
      document: '88899900011',
      name: 'COwner',
    });
    producerId = prod.id;
    const seasonRepo = ds.getRepository(Season);
    const s = await seasonRepo.save({ year: 2050 });
    seasonId = s.id;
    const farmRepo = ds.getRepository(Farm);
    const f = await farmRepo.save({
      name: 'C Farm',
      city: 'Cty',
      state: 'ST',
      totalArea: 30,
      arableArea: 15,
      vegetationArea: 15,
      producer: prod,
    });
    farmId = f.id;
    await ds.getRepository(Cultivation).clear();
  });

  afterAll(async () => {
    await ds.destroy();
    await app.close();
  });

  it('create → findAll → findOne → update → remove', async () => {
    const c = await service.create({ crop: 'CROP', farmId, seasonId });
    expect(c).toHaveProperty('id');
    const all = await service.findAll();
    expect(all.length).toBe(1);
    const one = await service.findOne(c.id);
    expect(one.id).toBe(c.id);
    const up = await service.update(c.id, { crop: 'NEW' });
    expect(up.crop).toBe('NEW');
    await service.remove(c.id);
    await expect(service.findOne(c.id)).rejects.toThrow();
  });
});
