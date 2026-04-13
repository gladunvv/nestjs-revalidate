import { SetMetadata } from '@nestjs/common';
import { REVALIDATE_METADATA } from '../metadata/metadata.constants';
import { LastModifiedProjector } from '../metadata/metadata.types';

export function LastModifiedBy<T = unknown>(
  projector: LastModifiedProjector<T>,
): MethodDecorator & ClassDecorator {
  return SetMetadata(REVALIDATE_METADATA, {
    lastModified: projector,
  });
}
