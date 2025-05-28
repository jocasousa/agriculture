import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SeasonsModule } from '../../src/seasons/seasons.module';
import { SeasonsService } from '../../src/seasons/seasons.service';
import { Producer } from '../../src/producers/entities/producer.entity';
import { Farm } from '../../src/farms/entities/farm.entity';
import { Season } from '../../src/seasons/entities/season.entity';
import { Cultivation } from '../../src/cultivation/entities/cultivation.entity';

describe('Seasons Integration (SQLite in-memory)', () => {
  let app: INestApplication;
  let service: SeasonsService;
  let ds: DataSource;

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
        SeasonsModule,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    ds = module.get<DataSource>(DataSource);
    service = module.get<SeasonsService>(SeasonsService);
    await ds.getRepository(Season).clear();
  });

  afterAll(async () => {
    await ds.destroy();
    await app.close();
  });

  it('create → findAll → findOne → update → remove', async () => {
    const s = await service.create({ year: 2030 });
    expect(s).toHaveProperty('id');
    const all = await service.findAll();
    expect(all.length).toBe(1);
    const one = await service.findOne(s.id);
    expect(one.id).toBe(s.id);
    const up = await service.update(s.id, { year: 2040 });
    expect(up.year).toBe(2040);
    await service.remove(s.id);
    await expect(service.findOne(s.id)).rejects.toThrow();
  });
});
