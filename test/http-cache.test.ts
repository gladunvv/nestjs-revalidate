import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import {
  REVALIDATE_ETAG_METADATA,
  REVALIDATE_LAST_MODIFIED_METADATA,
  REVALIDATE_CACHE_CONTROL_METADATA,
  REVALIDATE_VARY_METADATA,
  REVALIDATE_NO_STORE_METADATA,
} from '../src/metadata/metadata.constants';
import { HttpCache } from '../src/decorators/http-cache.decorator';

describe('HttpCache', () => {
  it('stores all metadata pieces', () => {
    const etag = (value: any) => value.version;
    const lastModified = (value: any) => value.updatedAt;

    class TestController {
      @HttpCache({
        etag,
        lastModified,
        cacheControl: 'private, max-age=0, must-revalidate',
        vary: ['Accept-Encoding'],
        noStore: true,
      })
      handler() {}
    }

    expect(Reflect.getMetadata(REVALIDATE_ETAG_METADATA, TestController.prototype.handler)).toEqual(
      {
        by: etag,
      },
    );

    expect(
      Reflect.getMetadata(REVALIDATE_LAST_MODIFIED_METADATA, TestController.prototype.handler),
    ).toBe(lastModified);

    expect(
      Reflect.getMetadata(REVALIDATE_CACHE_CONTROL_METADATA, TestController.prototype.handler),
    ).toBe('private, max-age=0, must-revalidate');

    expect(Reflect.getMetadata(REVALIDATE_VARY_METADATA, TestController.prototype.handler)).toEqual(
      ['Accept-Encoding'],
    );

    expect(
      Reflect.getMetadata(REVALIDATE_NO_STORE_METADATA, TestController.prototype.handler),
    ).toBe(true);
  });
});
