import { describe, it, expect } from 'vitest';
import { parseIfNoneMatch } from '../../../../src/core/etag/parse-if-none-match';

describe('parseIfNoneMatch', () => {
  it('returns empty result when header is undefined', () => {
    const result = parseIfNoneMatch(undefined);

    expect(result).toEqual({
      any: false,
      values: [],
    });
  });

  it('returns empty result when header is empty string', () => {
    const result = parseIfNoneMatch('');

    expect(result).toEqual({
      any: false,
      values: [],
    });
  });
});
