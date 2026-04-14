import { SetMetadata } from '@nestjs/common';
import { REVALIDATE_CACHE_CONTROL_METADATA } from '../metadata/metadata.constants';
import { CacheControlFactory } from '../metadata/metadata.types';

export function CacheControl<T = unknown>(
  value: string | CacheControlFactory<T>,
): MethodDecorator & ClassDecorator {
  return SetMetadata(REVALIDATE_CACHE_CONTROL_METADATA, {
    value,
  });
}
