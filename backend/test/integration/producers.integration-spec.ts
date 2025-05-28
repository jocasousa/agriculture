// test/producers.integration-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProducersService } from '../../src/producers/producers.service';
import { Producer } from '../../src/producers/entities/producer.entity';
import { Farm } from '../../src/farms/entities/farm.entity';
import { Season } from '../../src/seasons/entities/season.entity';
import { Cultivation } from '../../src/cultivation/entities/cultivation.entity';
import { ProducersModule } from '../../src/producers/producers.module';

describe('Producers Integration (SQLite in-memory)', () => {
  let app: INestApplication;
  let service: ProducersService;
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
        ProducersModule,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    service = module.get(ProducersService);
    ds = module.get(DataSource);
  });

  afterAll(async () => {
    await ds.destroy();
    await app.close();
  });

  beforeEach(async () => {
    await ds.getRepository(Producer).clear();
    await ds.getRepository(Farm).clear();
  });

  it('create → findOne → findAll → update → remove', async () => {
    // create
    const p = await service.create({
      document: '12345678901',
      name: 'Int Test',
    });
    expect(p).toHaveProperty('id');
    // findOne
    const one = await service.findOne(p.id);
    expect(one.name).toBe('Int Test');
    // findAll
    const all = await service.findAll();
    expect(all).toHaveLength(1);
    // update
    const up = await service.update(p.id, { name: 'Changed' });
    expect(up.name).toBe('Changed');
    // remove
    await service.remove(p.id);
    await expect(service.findOne(p.id)).rejects.toThrow();
  });
});
