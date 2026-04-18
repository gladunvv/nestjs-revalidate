import 'reflect-metadata';
import { it, expect } from 'vitest';
import request from 'supertest';
import { Controller, Get, Module, Param } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { RevalidateModule } from '../../../src/module/revalidate.module';
import { HttpCache } from '../../../src';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

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

async function createApp(setHeadersOnNotModified: boolean): Promise<NestFastifyApplication> {
  @Module({
    imports: [
      RevalidateModule.forRoot({
        setHeadersOnNotModified,
        etag: { mode: 'weak' },
      }),
    ],
    controllers: [UsersController],
  })
  class TestModule {}

  const moduleRef = await Test.createTestingModule({
    imports: [TestModule],
  }).compile();

  const app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  return app;
}

async function getNotModifiedResponse(app: NestFastifyApplication) {
  const server = app.getHttpServer();

  const first = await request(server).get('/users/1').expect(200);
  const etag = first.header.etag;

  if (!etag) {
    throw new Error('Expected ETag header to be present');
  }

  return request(server).get('/users/1').set('If-None-Match', etag).expect(304);
}

it('includes headers on 304 when setHeadersOnNotModified is true', async () => {
  const app = await createApp(true);

  try {
    const response = await getNotModifiedResponse(app);

    expect(response.header['cache-control']).toBeDefined();
    expect(response.header.vary).toBeDefined();
    expect(response.header.etag).toBeDefined();
    expect(response.header['last-modified']).toBeDefined();
  } finally {
    await app.close();
  }
});

it('omits headers on 304 when setHeadersOnNotModified is false', async () => {
  const app = await createApp(false);

  try {
    const response = await getNotModifiedResponse(app);

    expect(response.header['cache-control']).toBeUndefined();
    expect(response.header.vary).toBeUndefined();
    expect(response.header.etag).toBeUndefined();
    expect(response.header['last-modified']).toBeUndefined();
  } finally {
    await app.close();
  }
});
