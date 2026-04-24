import 'reflect-metadata';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { Controller, Get, Head, Module, Param } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

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
  @Head(':id')
  @HttpCache<User>({
    etag: (user) => user.version,
    lastModified: (user) => user.updatedAt,
    cacheControl: 'private, max-age=0, must-revalidate',
    vary: ['Accept-Encoding'],
  })
  findOne(@Param('id') id: string): User {
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
      setHeadersOnNotModified: true,
      etag: {
        mode: 'weak',
      },
    }),
  ],
  controllers: [UsersController],
})
class TestAppModule {}

describe('Express HEAD e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('returns headers for HEAD without response body', async () => {
    const response = await request(app.getHttpServer()).head('/users/1').expect(200);

    expect(response.header.etag).toBeDefined();
    expect(response.header['last-modified']).toBeDefined();
    expect(response.header['cache-control']).toBe('private, max-age=0, must-revalidate');
    expect(response.header.vary).toBe('Accept-Encoding');
    expect(response.text).toBeUndefined();
  });

  it('returns 304 for HEAD when If-None-Match matches', async () => {
    const first = await request(app.getHttpServer()).head('/users/1').expect(200);

    const etag = first.header.etag;
    if (!etag) {
      throw new Error('Expected ETag header to be present');
    }

    const second = await request(app.getHttpServer())
      .head('/users/1')
      .set('If-None-Match', etag)
      .expect(304);

    expect(second.header.etag).toBeDefined();
    expect(second.header['last-modified']).toBeDefined();
    expect(second.header['cache-control']).toBe('private, max-age=0, must-revalidate');
    expect(second.header.vary).toBe('Accept-Encoding');
    expect(second.text).toBeUndefined();
  });
});
