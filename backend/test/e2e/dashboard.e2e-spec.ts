import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Dashboard e2e', () => {
  let app: INestApplication;
  let server: any;
  let producerId: string;
  let farmId: string;
  let seasonId: string;
  let cultivationId: string;

  beforeAll(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    server = app.getHttpServer();

    // setup data
    const prod = await request(server)
      .post('/producers')
      .send({ document: '77766655544', name: 'Dash Prod' })
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
        name: 'Dash Farm',
        city: 'DF',
        state: 'DF',
        totalArea: 80,
        arableArea: 50,
        vegetationArea: 30,
        producerId,
      })
      .expect(201);
    farmId = farm.body.id;
    const cult = await request(server)
      .post('/cultivations')
      .send({ crop: 'Milho', farmId, seasonId })
      .expect(201);
    cultivationId = cult.body.id;
  });

  it('GET /dashboard/summary', async () => {
    const res = await request(server).get('/dashboard/summary').expect(200);
    expect(res.body).toHaveProperty('totalFarms');
    expect(res.body).toHaveProperty('totalArea');
  });

  it('GET /dashboard/by-state', () =>
    request(server)
      .get('/dashboard/by-state')
      .expect(200)
      .expect((res) => expect(Array.isArray(res.body)).toBe(true)));

  it('GET /dashboard/by-crop', () =>
    request(server)
      .get('/dashboard/by-crop')
      .expect(200)
      .expect((res) => expect(Array.isArray(res.body)).toBe(true)));

  it('GET /dashboard/land-use', () =>
    request(server)
      .get('/dashboard/land-use')
      .expect(200)
      .expect((res) => expect(res.body).toHaveProperty('arable')));

  afterAll(async () => {
    // cleanup
    await request(server).delete(`/cultivations/${cultivationId}`);
    await request(server).delete(`/farms/${farmId}`);
    await request(server).delete(`/seasons/${seasonId}`);
    await request(server).delete(`/producers/${producerId}`);
    await app.close();
  });
});
