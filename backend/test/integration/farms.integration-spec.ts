import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { FarmsModule } from '../../src/farms/farms.module';
import { FarmsService } from '../../src/farms/farms.service';
import { Producer } from '../../src/producers/entities/producer.entity';
import { Farm } from '../../src/farms/entities/farm.entity';
import { Season } from '../../src/seasons/entities/season.entity';
import { Cultivation } from '../../src/cultivation/entities/cultivation.entity';

describe('Farms Integration (SQLite in-memory)', () => {
  let app: INestApplication;
  let service: FarmsService;
  let ds: DataSource;
  let producerId: string;

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
        FarmsModule,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    ds = module.get<DataSource>(DataSource);
    service = module.get<FarmsService>(FarmsService);

    // seed a producer
    const prodRepo = ds.getRepository(Producer);
    const prod = await prodRepo.save({
      document: '55566677788',
      name: 'FarmOwner',
    });
    producerId = prod.id;
    await ds.getRepository(Farm).clear();
  });

  afterAll(async () => {
    await ds.destroy();
    await app.close();
  });

  it('create → findAll → findOne → update → remove', async () => {
    const dto = {
      name: 'F1',
      city: 'C1',
      state: 'ST',
      totalArea: 50,
      arableArea: 20,
      vegetationArea: 30,
      producerId,
    };
    const f = await service.create(dto);
    expect(f).toHaveProperty('id');
    const all = await service.findAll();
    expect(all.length).toBe(1);
    const one = await service.findOne(f.id);
    expect(one.id).toBe(f.id);
    const up = await service.update(f.id, { city: 'NewC' });
    expect(up.city).toBe('NewC');
    await service.remove(f.id);
    await expect(service.findOne(f.id)).rejects.toThrow();
  });
});
