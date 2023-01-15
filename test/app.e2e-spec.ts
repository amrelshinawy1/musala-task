import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('API endpoints testing (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/register a new user', () => {
    it('if username is existed', async () => {
      const res = await request(app.getHttpServer())
        .post('/register')
        .send({
          username: 'amr',
          password: 'password',
          email: 'amr@test.com',
          firstName: 'Hantsy',
          lastName: 'Bai'
        });
      expect(res.status).toBe(409);
    });

    it('if email is existed', async () => {
      const res = await request(app.getHttpServer())
        .post('/register')
        .send({
          username: 'amr1',
          password: 'password',
          email: 'amr@example.com',
          firstName: 'Hantsy',
          lastName: 'Bai'
        });
      expect(res.status).toBe(409);
    });

    it('successed', async () => {
      const res = await request(app.getHttpServer())
        .post('/register')
        .send({
          username: 'amr1',
          password: 'password',
          email: 'amr@gmail.com',
          firstName: 'Hantsy',
          lastName: 'Bai'
        });
      expect(res.status).toBe(201);
    });
  });

  describe('if user is not logged in', () => {
    it('/gateways (GET)', async () => {
      const res = await request(app.getHttpServer()).get('/gateways').send();
      expect(res.status).toBe(200);
      expect(res.body.length).toEqual(3);
    });

    it('/gateways (GET) if none existing should return 404', async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(app.getHttpServer()).get('/gateways/' + id);
      expect(res.status).toBe(404);
    });

    it('/gateways (GET) if invalid id should return 400', async () => {
      const id = "invalidid";
      const res = await request(app.getHttpServer()).get('/gateways/' + id);
      expect(res.status).toBe(400);
    });

    it('/gateways (POST) should return 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/gateways')
        .send({ name: 'test name' });
      expect(res.status).toBe(401);
    });

    it('/gateways (PUT) should return 401', async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(app.getHttpServer())
        .put('/gateways/' + id)
        .send({ name: 'test name' });
      expect(res.status).toBe(401);
    });

    it('/gateways (DELETE) should return 401', async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(app.getHttpServer())
        .delete('/gateways/' + id)
        .send();
      expect(res.status).toBe(401);
    });
  });

  describe('if user is logged in as (USER)', () => {
    let jwttoken: any;
    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'amr', password: 'password' });

      expect(res.status).toBe(201);
      jwttoken = res.body.access_token;
    });

    it('/gateways (GET)', async () => {
      const res = await request(app.getHttpServer()).get('/gateways');
      expect(res.status).toBe(200);
      expect(res.body.length).toEqual(3);
    });

    it('/gateways (POST) with empty body should return 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/gateways')
        .set('Authorization', 'Bearer ' + jwttoken)
        .send({});
      console.log(res.status);
      expect(res.status).toBe(400);
    });

    it('/gateways (PUT) if none existing should return 404', async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(app.getHttpServer())
        .put('/gateways/' + id)
        .set('Authorization', 'Bearer ' + jwttoken)
        .send({ name: 'test name' });
      expect(res.status).toBe(404);
    });

    it('/gateways (DELETE) if none existing should return 403', async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(app.getHttpServer())
        .delete('/gateways/' + id)
        .set('Authorization', 'Bearer ' + jwttoken)
        .send();
      expect(res.status).toBe(403);
    });
  });

  describe('if user is logged in as (ADMIN)', () => {
    let jwttoken: any;
    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'password' });
      jwttoken = res.body.access_token;
    });

    it('/gateways (DELETE) if none existing should return 404', async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(app.getHttpServer())
        .delete('/gateways/' + id)
        .set('Authorization', 'Bearer ' + jwttoken)
        .send();
      expect(res.status).toBe(404);
    });
  });
});
