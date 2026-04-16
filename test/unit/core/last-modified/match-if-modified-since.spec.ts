import { describe, it, expect } from 'vitest';
import { matchesIfModifiedSince } from '../../../../src/core/last-modified/match-if-modified-since';

describe('matchesIfModifiedSince', () => {
  const lastModified = new Date('2026-04-16T12:00:00.000Z');

  it('returns false when current last modified is missing', () => {
    expect(matchesIfModifiedSince(undefined, lastModified.toUTCString())).toBe(false);
  });

  it('returns false when header is missing', () => {
    expect(matchesIfModifiedSince(lastModified, undefined)).toBe(false);
  });

  it('returns true when current last modified is equal to header', () => {
    expect(matchesIfModifiedSince(lastModified, lastModified.toUTCString())).toBe(true);
  });

  it('returns true when header is older than current last modified', () => {
    const later = new Date('2026-04-16T12:00:01.000Z');

    expect(matchesIfModifiedSince(lastModified, later.toUTCString())).toBe(true);
  });

  it('returns false when header is newer than current last modified', () => {
    const earlier = new Date('2026-04-16T11:59:59.000Z');

    expect(matchesIfModifiedSince(lastModified, earlier.toUTCString())).toBe(false);
  });

  it('returns false when header is not a valid date', () => {
    expect(matchesIfModifiedSince(lastModified, 'not a date')).toBe(false);
  });
});
