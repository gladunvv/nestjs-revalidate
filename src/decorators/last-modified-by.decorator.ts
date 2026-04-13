import { SetMetadata } from '@nestjs/common';
import { REVALIDATE_LAST_MODIFIED_METADATA } from '../metadata/metadata.constants';
import { LastModifiedProjector } from '../metadata/metadata.types';

export function LastModifiedBy<T = unknown>(
  projector: LastModifiedProjector<T>,
): MethodDecorator & ClassDecorator {
  return SetMetadata(REVALIDATE_LAST_MODIFIED_METADATA, {
    lastModified: projector,
  });
}
