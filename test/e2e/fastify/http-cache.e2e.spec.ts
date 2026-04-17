import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Controller, Get, Module, Param } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { RevalidateModule } from '../../../src/module/revalidate.module';
import { HttpCache } from '../../../src';

interface User {
  id: string;
  version: number;
  name: string;
  updatedAt: Date;
}

@Controller('users')
class UsersController {
  @Get(':id')
  @HttpCache({
    etag: (user: User) => user.version,
    lastModified: (user: User) => user.updatedAt,
    cacheControl: 'private, max-age=0, must-revalidate',
    vary: ['Accept-Encoding'],
  })
  findOne(@Param('id') id: string) {
    return {
      id,
      version: 7,
      name: 'Alex',
      updatedAt: new Date('2026-04-16T12:00:00.000Z'),
    };
  }
}

@Module({
  imports: [
    RevalidateModule.forRoot({
      onProjectorError: 'throw',
      setHeadersOnNotModified: true,
      etag: {
        mode: 'weak',
        hashAlgorithm: 'sha1',
      },
    }),
  ],
  controllers: [UsersController],
})
class TestAppModule {}

describe('Fastify HttpCache e2e', () => {
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

  it('returns 200 with Cache-Control, Vary, ETag, and Last-Modified and then 304 when If-None-Match matches', async () => {
    const server = app.getHttpServer();

    const first = await request(server).get('/users/1').expect(200);
    const etag = first.header.etag;
    if (!etag) {
      throw new Error('Expected ETag header to be present');
    }
    expect(first.header['cache-control']).toBe('private, max-age=0, must-revalidate');
    expect(first.header.vary).toBe('Accept-Encoding');
    expect(first.header['last-modified']).toBe(new Date('2026-04-16T12:00:00.000Z').toUTCString());
    expect(etag).toBeDefined();

    const second = await request(server).get('/users/1').set('If-None-Match', etag).expect(304);

    expect(second.header['cache-control']).toBe('private, max-age=0, must-revalidate');
    expect(second.header.vary).toBe('Accept-Encoding');
    expect(second.header.etag).toBeDefined();
    expect(second.header['last-modified']).toBeDefined();

    expect(second.text).toBe('');
  });
});
