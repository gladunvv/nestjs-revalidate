import { SetMetadata } from '@nestjs/common';
import { REVALIDATE_ETAG_METADATA } from '../metadata/metadata.constants';
import { EtagProjector } from '../metadata/metadata.types';

export function EtagBy<T = unknown>(
  projector: EtagProjector<T>,
  mode?: 'weak' | 'strong',
): MethodDecorator & ClassDecorator {
  return SetMetadata(REVALIDATE_ETAG_METADATA, {
    by: projector,
    ...(mode !== undefined ? { mode } : {}),
  });
}
