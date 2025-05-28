import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { Cultivation } from 'src/cultivation/entities/cultivation.entity';
import { Farm } from 'src/farms/entities/farm.entity';
import { Season } from 'src/seasons/entities/season.entity';
import { Producer } from 'src/producers/entities/producer.entity';

describe('Cultivations e2e', () => {
  let app: INestApplication;
  let server;
  let producerId: string;
  let farmId: string;
  let seasonId: string;
  let cultivationId: string;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    const ds: DataSource = mod.get(DataSource);

    // Apaga primeiro cultivações (filho)
    await ds.createQueryBuilder().delete().from(Cultivation).execute();
    // Depois fazendas
    await ds.createQueryBuilder().delete().from(Farm).execute();
    // Depois safra
    await ds.createQueryBuilder().delete().from(Season).execute();
    // Por fim produtores
    await ds.createQueryBuilder().delete().from(Producer).execute();

    await app.init();
    server = app.getHttpServer();

    // create dependencies
    const prod = await request(server)
      .post('/producers')
      .send({ document: '11122233344', name: 'C E2E' })
      .expect(201);
    producerId = prod.body.id;
    const season = await request(server)
      .post('/seasons')
      .send({ year: 2025 })
      .expect(201);
    seasonId = season.body.id;
    const farm = await request(server)
      .post('/farms')
      .send({
        name: 'C Farm',
        city: 'C',
        state: 'S',
        totalArea: 10,
        arableArea: 5,
        vegetationArea: 5,
        producerId,
      })
      .expect(201);
    farmId = farm.body.id;
  });

  it('POST /cultivations', async () => {
    const dto = { crop: 'Soja', farmId, seasonId };
    const res = await request(server)
      .post('/cultivations')
      .send(dto)
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.crop).toBe('Soja');
    cultivationId = res.body.id;
  });

  it('GET /cultivations', () =>
    request(server)
      .get('/cultivations')
      .expect(200)
      .expect((res) =>
        expect(res.body.some((c) => c.id === cultivationId)).toBe(true),
      ));

  it('GET /cultivations/:id', () =>
    request(server)
      .get(`/cultivations/${cultivationId}`)
      .expect(200)
      .expect((res) => expect(res.body.id).toBe(cultivationId)));

  it('PATCH /cultivations/:id', () =>
    request(server)
      .patch(`/cultivations/${cultivationId}`)
      .send({ crop: 'Milho' })
      .expect(200)
      .expect((res) => expect(res.body.crop).toBe('Milho')));

  it('DELETE /cultivations/:id', () =>
    request(server)
      .delete(`/cultivations/${cultivationId}`)
      .expect(204)
      .then(() =>
        request(server).get(`/cultivations/${cultivationId}`).expect(404),
      ));

  afterAll(async () => {
    await request(server).delete(`/farms/${farmId}`);
    await request(server).delete(`/seasons/${seasonId}`);
    await request(server).delete(`/producers/${producerId}`);
    await app.close();
  });
});
