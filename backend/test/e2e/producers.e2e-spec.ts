import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

describe('Producers e2e', () => {
  let app: INestApplication;
  let server;
  let producerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    server = app.getHttpServer();
  });

  it('POST /producers', async () => {
    const res = await request(server)
      .post('/producers')
      .send({ document: '55544433322', name: 'E2E Producer' })
      .expect(201);
    producerId = res.body.id;
    expect(res.body).toHaveProperty('id');
  });

  it('GET /producers', () =>
    request(server)
      .get('/producers')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((p) => p.id === producerId)).toBe(true);
      }));

  it('GET /producers/:id', () =>
    request(server)
      .get(`/producers/${producerId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(producerId);
      }));

  it('PATCH /producers/:id', () =>
    request(server)
      .patch(`/producers/${producerId}`)
      .send({ name: 'Updated E2E' })
      .expect(200)
      .expect((res) => expect(res.body.name).toBe('Updated E2E')));

  it('DELETE /producers/:id', () =>
    request(server)
      .delete(`/producers/${producerId}`)
      .expect(204)
      .then(() => request(server).get(`/producers/${producerId}`).expect(404)));

  afterAll(async () => await app.close());
});
