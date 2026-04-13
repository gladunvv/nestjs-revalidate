import { SetMetadata } from '@nestjs/common';
import { REVALIDATE_METADATA } from '../metadata/metadata.constants';
import { HttpCacheOptions, RevalidateRouteMetadata } from '../metadata/metadata.types';

export function HttpCache<T = unknown>(
  options: HttpCacheOptions<T>,
): MethodDecorator & ClassDecorator {
  const normalized: RevalidateRouteMetadata<T> = {};

  if (options.etag !== undefined) {
    normalized.etag = typeof options.etag === 'function' ? { by: options.etag } : options.etag;
  }

  if (options.lastModified !== undefined) {
    normalized.lastModified = options.lastModified;
  }

  if (options.cacheControl !== undefined) {
    normalized.cacheControl = options.cacheControl;
  }

  if (options.vary !== undefined) {
    normalized.vary = options.vary;
  }

  if (options.noStore !== undefined) {
    normalized.noStore = options.noStore;
  }

  return SetMetadata(REVALIDATE_METADATA, normalized);
}
