import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Controller, Get, Module, Param } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { RevalidateModule } from '../../../src/module/revalidate.module';
import { EtagBy } from '../../../src/decorators/etag-by.decorator';

@Controller('users')
class UsersController {
  @Get(':id')
  @EtagBy((value: { version: number }) => value.version)
  findOne(@Param('id') id: string) {
    return {
      id,
      version: 7,
      name: 'Alex',
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

describe('Fastify ETag e2e', () => {
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
    await app.close();
  });

  it('returns 200 with ETag and then 304 when If-None-Match matches', async () => {
    const server = app.getHttpServer();

    const first = await request(server).get('/users/1').expect(200);

    const etag = first.header.etag;
    expect(etag).toBeDefined();

    if (!etag) {
      throw new Error('ETag header is missing');
    }

    const second = await request(server).get('/users/1').set('If-None-Match', etag).expect(304);

    expect(second.text).toBe('');
  });
});
