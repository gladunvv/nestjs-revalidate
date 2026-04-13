import { SetMetadata } from '@nestjs/common';
import { REVALIDATE_METADATA } from '../metadata/metadata.constants';
import { EtagProjector } from '../metadata/metadata.types';

export function EtagBy<T = unknown>(
  projector: EtagProjector<T>,
  mode?: 'weak' | 'strong',
): MethodDecorator & ClassDecorator {
  return SetMetadata(REVALIDATE_METADATA, {
    etag: {
      by: projector,
      mode,
    },
  });
}
