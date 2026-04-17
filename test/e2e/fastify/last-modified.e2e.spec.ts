import 'reflect-metadata';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { Controller, Get, Module, Param } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { RevalidateModule } from '../../../src/module/revalidate.module';
import { LastModifiedBy } from '../../../src/decorators/last-modified-by.decorator';

@Controller('posts')
class PostsController {
  @Get(':id')
  @LastModifiedBy((value: { updatedAt: Date }) => value.updatedAt)
  findOne(@Param('id') id: string) {
    return {
      id,
      updatedAt: new Date('2026-04-16T12:00:00.000Z'),
      title: 'Hello',
    };
  }
}

@Module({
  imports: [RevalidateModule.forRoot()],
  controllers: [PostsController],
})
class TestAppModule {}

describe('Fastify Last-Modified e2e', () => {
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

  it('returns 200 with Last-Modified and then 304 when If-Modified-Since matches', async () => {
    const first = await request(app.getHttpServer()).get('/posts/1').expect(200);

    const lastModified = first.header['last-modified'];
    expect(lastModified).toBeDefined();

    if (!lastModified) {
      throw new Error('Expected Last-Modified header to be present');
    }

    const second = await request(app.getHttpServer())
      .get('/posts/1')
      .set('If-Modified-Since', lastModified)
      .expect(304);

    expect(second.text).toBe('');
  });
});
