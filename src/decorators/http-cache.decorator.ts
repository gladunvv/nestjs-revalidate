import { applyDecorators } from '@nestjs/common';
import { EtagBy } from './etag-by.decorator';
import { LastModifiedBy } from './last-modified-by.decorator';
import { CacheControl } from './cache-control.decorator';
import { Vary } from './vary.decorator';
import { NoStore } from './no-store.decorator';
import { HttpCacheOptions } from '../metadata/metadata.types';

export function HttpCache<T = unknown>(
  options: HttpCacheOptions<T>,
): MethodDecorator & ClassDecorator {
  const decorators: Array<ClassDecorator | MethodDecorator> = [];

  if (options.etag !== undefined) {
    if (typeof options.etag === 'function') {
      decorators.push(EtagBy(options.etag));
    } else {
      decorators.push(EtagBy(options.etag.by, options.etag.mode));
    }
  }

  if (options.lastModified !== undefined) {
    decorators.push(LastModifiedBy(options.lastModified));
  }

  if (options.cacheControl !== undefined) {
    decorators.push(CacheControl(options.cacheControl));
  }

  if (options.vary !== undefined) {
    if (typeof options.vary === 'function') {
      decorators.push(Vary(options.vary as never));
    } else {
      decorators.push(Vary(...options.vary));
    }
  }

  if (options.noStore) {
    decorators.push(NoStore());
  }

  return applyDecorators(...decorators);
}