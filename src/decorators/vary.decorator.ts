import { SetMetadata } from '@nestjs/common';
import { REVALIDATE_METADATA } from '../metadata/metadata.constants';

export function Vary(...headers: string[]): MethodDecorator & ClassDecorator {
  return SetMetadata(REVALIDATE_METADATA, {
    vary: headers,
  });
}
