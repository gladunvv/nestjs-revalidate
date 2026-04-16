import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Controller, Get, Module, Param } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { RevalidateModule } from '../../src/module/revalidate.module';
import { EtagBy } from '../../src/decorators/etag-by.decorator';

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

describe('Express ETag e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 with ETag and then 304 when If-None-Match matches', async () => {
    const first = await request(app.getHttpServer()).get('/users/1').expect(200);

    const etag = first.header.etag;
    expect(etag).toBeDefined();

    if (!etag) {
      throw new Error('ETag header is missing');
    }

    const second = await request(app.getHttpServer())
      .get('/users/1')
      .set('If-None-Match', etag)
      .expect(304);

    expect(second.text).toBe('');
  });
});
