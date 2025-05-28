import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

describe('Farms e2e', () => {
  let app: INestApplication;
  let server;
  let producerId: string;
  let farmId: string;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    server = app.getHttpServer();
    // create producer
    const prod = await request(server)
      .post('/producers')
      .send({ document: '66655544433', name: 'Farm E2E Prod' })
      .expect(201);
    producerId = prod.body.id;
  });

  it('POST /farms', async () => {
    const dto = {
      name: 'E2E Farm',
      city: 'City',
      state: 'ST',
      totalArea: 20,
      arableArea: 10,
      vegetationArea: 10,
      producerId,
    };
    const res = await request(server).post('/farms').send(dto).expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.producer.id).toBe(producerId);
    farmId = res.body.id;
  });

  it('GET /farms', () =>
    request(server)
      .get('/farms')
      .expect(200)
      .expect((res) =>
        expect(res.body.some((f) => f.id === farmId)).toBe(true),
      ));

  it('GET /farms/:id', () =>
    request(server)
      .get(`/farms/${farmId}`)
      .expect(200)
      .expect((res) => expect(res.body.id).toBe(farmId)));

  it('PATCH /farms/:id', () =>
    request(server)
      .patch(`/farms/${farmId}`)
      .send({ city: 'NewCity' })
      .expect(200)
      .expect((res) => expect(res.body.city).toBe('NewCity')));

  it('DELETE /farms/:id', () =>
    request(server)
      .delete(`/farms/${farmId}`)
      .expect(204)
      .then(() => request(server).get(`/farms/${farmId}`).expect(404)));

  afterAll(async () => {
    await request(server).delete(`/producers/${producerId}`);
    await app.close();
  });
});
