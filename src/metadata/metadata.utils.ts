import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { REVALIDATE_METADATA } from './metadata.constants';
import { RevalidateRouteMetadata } from './metadata.types';

export function getMergedRevalidateMetadata(
  reflector: Reflector,
  context: ExecutionContext,
): RevalidateRouteMetadata | undefined {
  const controllerMeta =
    reflector.get<RevalidateRouteMetadata>(REVALIDATE_METADATA, context.getClass()) ?? {};

  const handlerMeta =
    reflector.get<RevalidateRouteMetadata>(REVALIDATE_METADATA, context.getHandler()) ?? {};

  const merged: RevalidateRouteMetadata = {};

  const etag = handlerMeta.etag ?? controllerMeta.etag;
  if (etag !== undefined) {
    merged.etag = etag;
  }

  const lastModified = handlerMeta.lastModified ?? controllerMeta.lastModified;
  if (lastModified !== undefined) {
    merged.lastModified = lastModified;
  }

  const cacheControl = handlerMeta.cacheControl ?? controllerMeta.cacheControl;
  if (cacheControl !== undefined) {
    merged.cacheControl = cacheControl;
  }

  const vary = handlerMeta.vary ?? controllerMeta.vary;
  if (vary !== undefined) {
    merged.vary = vary;
  }

  const noStore = handlerMeta.noStore ?? controllerMeta.noStore;
  if (noStore !== undefined) {
    merged.noStore = noStore;
  }

  const isEmpty = Object.values(merged).every((v) => v === undefined);
  return isEmpty ? undefined : merged;
}
