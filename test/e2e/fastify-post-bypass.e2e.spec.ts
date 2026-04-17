import 'reflect-metadata';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { Body, Controller, Module, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { RevalidateModule } from '../../src/module/revalidate.module';
import { EtagBy } from '../../src/decorators/etag-by.decorator';

@Controller('users')
class UsersController {
  @Post()
  @EtagBy((value: { id: string }) => value.id)
  create(@Body() body: { name: string }) {
    return {
      id: '1',
      name: body.name,
    };
  }
}

@Module({
  imports: [
    RevalidateModule.forRoot({
      etag: { mode: 'weak' },
    }),
  ],
  controllers: [UsersController],
})
class TestAppModule {}

describe('Fastify POST bypass e2e', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('does not apply revalidation logic to POST requests', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .set('If-None-Match', '"anything"')
      .send({ name: 'Alex' })
      .expect(201);

    expect(response.body).toEqual({
      id: '1',
      name: 'Alex',
    });

    expect(response.header.etag).toBeUndefined();
  });
});
