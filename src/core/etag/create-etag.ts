import { stableStringify } from '../../utils/stable-stringify';
import { sha1 } from '../../utils/sha1';
import { EtagInput } from '../../metadata/metadata.types';

export function createEtag(input: EtagInput, mode: 'weak' | 'strong' = 'weak'): string | undefined {
  if (input === undefined || input === null) {
    return undefined;
  }

  const normalized =
    typeof input === 'string'
      ? input
      : typeof input === 'number' || typeof input === 'boolean'
        ? String(input)
        : input instanceof Date
          ? input.toISOString()
          : stableStringify(input);

  const digest = sha1(normalized);

  return mode === 'weak' ? `W/"${digest}"` : `"${digest}"`;
}
