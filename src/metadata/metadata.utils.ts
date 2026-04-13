import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import {
  REVALIDATE_ETAG_METADATA,
  REVALIDATE_LAST_MODIFIED_METADATA,
  REVALIDATE_CACHE_CONTROL_METADATA,
  REVALIDATE_VARY_METADATA,
  REVALIDATE_NO_STORE_METADATA,
} from './metadata.constants';
import { RevalidateRouteMetadata } from './metadata.types';

export function getMergedRevalidateMetadata(
  reflector: Reflector,
  context: ExecutionContext,
): RevalidateRouteMetadata | undefined {
  const controllerEtag = reflector.get<RevalidateRouteMetadata['etag']>(
    REVALIDATE_ETAG_METADATA,
    context.getClass(),
  );

  const handlerEtag = reflector.get<RevalidateRouteMetadata['etag']>(
    REVALIDATE_ETAG_METADATA,
    context.getHandler(),
  );

  const controllerLastModified = reflector.get<RevalidateRouteMetadata['lastModified']>(
    REVALIDATE_LAST_MODIFIED_METADATA,
    context.getClass(),
  );

  const handlerLastModified = reflector.get<RevalidateRouteMetadata['lastModified']>(
    REVALIDATE_LAST_MODIFIED_METADATA,
    context.getHandler(),
  );

  const controllerCacheControl = reflector.get<RevalidateRouteMetadata['cacheControl']>(
    REVALIDATE_CACHE_CONTROL_METADATA,
    context.getClass(),
  );

  const handlerCacheControl = reflector.get<RevalidateRouteMetadata['cacheControl']>(
    REVALIDATE_CACHE_CONTROL_METADATA,
    context.getHandler(),
  );

  const controllerVary = reflector.get<RevalidateRouteMetadata['vary']>(
    REVALIDATE_VARY_METADATA,
    context.getClass(),
  );

  const handlerVary = reflector.get<RevalidateRouteMetadata['vary']>(
    REVALIDATE_VARY_METADATA,
    context.getHandler(),
  );

  const controllerNoStore = reflector.get<RevalidateRouteMetadata['noStore']>(
    REVALIDATE_NO_STORE_METADATA,
    context.getClass(),
  );

  const handlerNoStore = reflector.get<RevalidateRouteMetadata['noStore']>(
    REVALIDATE_NO_STORE_METADATA,
    context.getHandler(),
  );

  const merged: RevalidateRouteMetadata = {};

  const etag = handlerEtag ?? controllerEtag;
  if (etag !== undefined) {
    merged.etag = etag;
  }

  const lastModified = handlerLastModified ?? controllerLastModified;
  if (lastModified !== undefined) {
    merged.lastModified = lastModified;
  }

  const cacheControl = handlerCacheControl ?? controllerCacheControl;
  if (cacheControl !== undefined) {
    merged.cacheControl = cacheControl;
  }

  const vary = handlerVary ?? controllerVary;
  if (vary !== undefined) {
    merged.vary = vary;
  }

  const noStore = handlerNoStore ?? controllerNoStore;
  if (noStore !== undefined) {
    merged.noStore = noStore;
  }

  return Object.keys(merged).length === 0 ? undefined : merged;
}
