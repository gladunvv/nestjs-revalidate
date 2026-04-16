import { describe, it, expect } from 'vitest';
import { normalizeLastModified } from '../../../../src/core/last-modified/normalize-last-modified';

describe('normalizeLastModified', () => {
  it('returns undefined when value is undefined', () => {
    expect(normalizeLastModified(undefined)).toBeUndefined();
  });

  it('returns undefined when value is null', () => {
    expect(normalizeLastModified(null)).toBeUndefined();
  });

  it('returns undefined when value is not a valid date', () => {
    expect(normalizeLastModified('not a date')).toBeUndefined();
  });

  it('returns the same date when value is a Date', () => {
    const date = new Date('2026-04-16T12:00:00.000Z');
    const result = normalizeLastModified(date);

    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe('2026-04-16T12:00:00.000Z');
  });

  it('returns a date when value is a valid date string', () => {
    const result = normalizeLastModified('2026-04-16T12:00:00.000Z');

    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe('2026-04-16T12:00:00.000Z');
  });

  it('returns a date when value is a valid timestamp', () => {
    const result = normalizeLastModified(1718505600000);

    expect(result).toBeInstanceOf(Date);
    expect(result?.getTime()).toBe(1718505600000);
  });
});
