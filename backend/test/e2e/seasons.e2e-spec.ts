import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { Season } from 'src/seasons/entities/season.entity';

describe('Seasons e2e', () => {
  let app: INestApplication;
  let server;
  let seasonId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    const ds: DataSource = module.get(DataSource);

    await ds.createQueryBuilder().delete().from(Season).execute();

    await app.init();
    server = app.getHttpServer();
  });

  it('POST /seasons', async () => {
    const res = await request(server)
      .post('/seasons')
      .send({ year: 2030 })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.year).toBe(2030);
    seasonId = res.body.id;
  });

  it('GET /seasons', () =>
    request(server)
      .get('/seasons')
      .expect(200)
      .expect((res) => {
        expect(res.body.some((s) => s.id === seasonId)).toBe(true);
      }));

  it('GET /seasons/:id', () =>
    request(server)
      .get(`/seasons/${seasonId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(seasonId);
      }));

  it('PATCH /seasons/:id', () =>
    request(server)
      .patch(`/seasons/${seasonId}`)
      .send({ year: 2040 })
      .expect(200)
      .expect((res) => expect(res.body.year).toBe(2040)));

  it('DELETE /seasons/:id', () =>
    request(server)
      .delete(`/seasons/${seasonId}`)
      .expect(204)
      .then(() => request(server).get(`/seasons/${seasonId}`).expect(404)));

  afterAll(async () => await app.close());
});
