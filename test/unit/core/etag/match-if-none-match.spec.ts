import { describe, it, expect } from 'vitest';
import { matchesIfNoneMatch } from '../../../../src/core/etag/match-if-none-match';

describe('matchesIfNoneMatch', () => {
  it('returns false when current etag is missing', () => {
    expect(matchesIfNoneMatch(undefined, '"abc"')).toBe(false);
  });

  it('returns false when header is missing', () => {
    expect(matchesIfNoneMatch('"abc"', undefined)).toBe(false);
  });

  it('matches exact strong etag', () => {
    expect(matchesIfNoneMatch('"abc"', '"abc"')).toBe(true);
  });

  it('does not match different etag', () => {
    expect(matchesIfNoneMatch('"abc"', '"def"')).toBe(false);
  });

  it('matches weak and strong etags by normalized value', () => {
    expect(matchesIfNoneMatch('W/"abc"', '"abc"')).toBe(true);
    expect(matchesIfNoneMatch('"abc"', 'W/"abc"')).toBe(true);
  });

  it('matches one of comma-separated values', () => {
    expect(matchesIfNoneMatch('"abc"', '"def", "abc", "xyz"')).toBe(true);
  });

  it('supports wildcard', () => {
    expect(matchesIfNoneMatch('"abc"', '*')).toBe(true);
  });

  it('returns false when comma-separated list has no match', () => {
    expect(matchesIfNoneMatch('"abc"', '"def", "xyz"')).toBe(false);
  });
});
