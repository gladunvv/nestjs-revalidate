import { SetMetadata } from '@nestjs/common';
import { REVALIDATE_NO_STORE_METADATA } from '../metadata/metadata.constants';

export function NoStore(): MethodDecorator & ClassDecorator {
  return SetMetadata(REVALIDATE_NO_STORE_METADATA, true);
}
