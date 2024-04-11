import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { User } from './../src/user/user.entity';

process.env.NODE_ENV = 'test';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);
    dataSource.synchronize();
    // crear database before test runs
  });

  beforeEach(async () => {
    await dataSource.createQueryBuilder().delete().from(User).execute();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
  const testUser = {
    username: 'test',
    fullName: 'Test User',
    password: 'test12345',
  };

  const testUserNoFullName = {
    username: 'test2',
    password: '12345678',
  };

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('User auth', () => {
    it('signs in user with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/user/signup')
        .send(testUser);
      expect(res.status).toBe(201);
      expect(typeof res.body.jwt).toBe('string');
    });

    it('throws BadRequestException trying to signup user with existing username', async () => {
      await request(app.getHttpServer()).post('/user/signup').send(testUser);
      const res = await request(app.getHttpServer())
        .post('/user/signup')
        .send(testUser);
      expect(res.status).toBe(400);
      expect(res.body.messages).toContain(
        'User with this username already exists.Please try another one.',
      );
    });

    it('throws BadRequestException trying to signup with invalid password', async () => {
      const res = await request(app.getHttpServer())
        .post('/user/signup')
        .send({ ...testUser, password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.messages).toContain(
        'password must be longer than or equal to 8 characters',
      );
    });

    it('signs up user without unnecessary data', async () => {
      const res = await request(app.getHttpServer())
        .post('/user/signup')
        .send(testUserNoFullName);

      expect(res.status).toBe(201);
      expect(typeof res.body.jwt).toBe('string');
    });

    it('throws BadRequestException trying to signup user without username', async () => {
      const res = await request(app.getHttpServer())
        .post('/user/signup')
        .send({ password: '12345678' });
      expect(res.status).toBe(400);
      expect(res.body.messages).toContain('username must be a string');
    });

    it('logs in user with correct credentials', async () => {
      await request(app.getHttpServer()).post('/user/signup').send(testUser);

      const res = await request(app.getHttpServer())
        .post('/user/login')
        .send({ username: testUser.username, password: testUser.password });

      expect(res.status).toBe(201);
      expect(typeof res.body.jwt).toBe('string');
    });

    it('throws BadRequestException if credentials are not valid', async () => {
      await request(app.getHttpServer()).post('/user/signup').send(testUser);

      const res = await request(app.getHttpServer())
        .post('/user/login')
        .send({
          username: testUser.username,
          password: testUser.password + '1',
        });

      expect(res.status).toBe(400);
      expect(res.body.messages).toContain('Invalid login or password');
    });

    it('throws BadRequestException trying to login user with invalid password', async () => {
      await request(app.getHttpServer()).post('/user/signup').send(testUser);

      const res = await request(app.getHttpServer()).post('/user/login').send({
        username: testUser.username,
        password: '123',
      });

      expect(res.status).toBe(400);
      expect(res.body.messages).toContain(
        'password must be longer than or equal to 8 characters',
      );
    });

    it('throws BadRequestException trying to login user with invalid credentials', async () => {
      await request(app.getHttpServer()).post('/user/signup').send(testUser);

      const res = await request(app.getHttpServer()).post('/user/login').send({
        username: testUser.username,
      });

      expect(res.status).toBe(400);
      expect(res.body.messages).toContain('password must be a string');
    });

    it('returns current authorized user after signup', async () => {
      const signUpResponse = await request(app.getHttpServer())
        .post('/user/signup')
        .send(testUser);

      const { jwt } = signUpResponse.body;

      const res = await request(app.getHttpServer())
        .get('/user/me')
        .set('Authorization', `Bearer ${jwt}`);

      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual({
        id: expect.any(String),
        username: testUser.username,
        fullName: testUser.fullName,
        createdAt: expect.anything(),
      });
    });

    it('returns current authorized user after login', async () => {
      await request(app.getHttpServer()).post('/user/signup').send(testUser);

      const loginResponse = await request(app.getHttpServer())
        .post('/user/login')
        .send({ username: testUser.username, password: testUser.password });

      const { jwt } = loginResponse.body;

      const res = await request(app.getHttpServer())
        .get('/user/me')
        .set('Authorization', `Bearer ${jwt}`);

      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual({
        id: expect.any(String),
        username: testUser.username,
        fullName: testUser.fullName,
        createdAt: expect.anything(),
      });
    });

    it('throws UnauthorizedException trying to get current user without token', async () => {
      const res = await request(app.getHttpServer()).get('/user/me');
      expect(res.status).toBe(401);
      expect(res.body.messages).toContain(
        'You are not authorized to access this resource.',
      );
    });

    it('loggs out current user', async () => {
      const signUpRes = await request(app.getHttpServer())
        .post('/user/signup')
        .send(testUser);

      const { jwt } = signUpRes.body;

      const res = await request(app.getHttpServer())
        .post('/user/logout')
        .set('Authorization', `Bearer ${jwt}`);

      expect(res.status).toBe(201);
      expect(res.body).toStrictEqual({});
    });

    it('throws UnauthorizedException trying to logout without token', async () => {
      const res = await request(app.getHttpServer()).post('/user/logout');
      expect(res.status).toBe(401);
      expect(res.body.messages).toContain(
        'You are not authorized to access this resource.',
      );
    });
  });
});
