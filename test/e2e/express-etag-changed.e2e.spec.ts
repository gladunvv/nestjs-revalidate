import 'reflect-metadata';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { Controller, Get, Module, Param } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { RevalidateModule } from '../../src/module/revalidate.module';
import { EtagBy } from '../../src/decorators/etag-by.decorator';

@Controller('users')
class UsersController {
  private version = 1;

  @Get(':id')
  @EtagBy((value: { version: number }) => value.version)
  findOne(@Param('id') id: string) {
    const result = {
      id,
      version: this.version,
      name: 'Alex',
    };

    this.version += 1;

    return result;
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

describe('Express changed ETag e2e', () => {
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

  it('returns 200 when resource version changed and If-None-Match contains old ETag', async () => {
    const first = await request(app.getHttpServer()).get('/users/1').expect(200);

    const etag = first.header.etag;
    expect(etag).toBeDefined();

    if (!etag) {
      throw new Error('Expected ETag header to be present');
    }

    const second = await request(app.getHttpServer())
      .get('/users/1')
      .set('If-None-Match', etag)
      .expect(200);

    expect(second.header.etag).toBeDefined();
    expect(second.header.etag).not.toBe(etag);
    expect(second.body.version).toBe(2);
  });
});
