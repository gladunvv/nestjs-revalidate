import { SetMetadata } from '@nestjs/common';
import { REVALIDATE_METADATA } from '../metadata/metadata.constants';

export function NoStore(): MethodDecorator & ClassDecorator {
  return SetMetadata(REVALIDATE_METADATA, {
    noStore: true,
  });
}
