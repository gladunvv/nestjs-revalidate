import { describe, it, expect } from 'vitest';
import { stableStringify } from '../../../src/utils/stable-stringify';

describe('stableStringify', () => {
  it('returns the same string for objects with different key order', () => {
    const first = { a: 1, b: 2 };
    const second = { b: 2, a: 1 };

    expect(stableStringify(first)).toBe('{"a":1,"b":2}');
    expect(stableStringify(first)).toBe(stableStringify(second));
  });

  it('sorts keys in nested objects', () => {
    const input = {
      z: 1,
      a: {
        d: 4,
        b: 2,
        c: 3,
      },
    };

    expect(stableStringify(input)).toBe('{"a":{"b":2,"c":3,"d":4},"z":1}');
  });

  it('keeps array order unchanged', () => {
    const input = [3, 1, 2];

    expect(stableStringify(input)).toBe('[3,1,2]');
  });

  it('serializes dates as ISO strings', () => {
    const input = {
      updatedAt: new Date('2026-04-16T12:00:00.900Z'),
    };

    expect(stableStringify(input)).toBe('{"updatedAt":"2026-04-16T12:00:00.900Z"}');
  });

  it('handles nested arrays and nested dates', () => {
    const input = {
      items: [
        { createdAt: new Date('2026-04-16T12:00:00.900Z') },
        { createdAt: new Date('2026-04-16T12:00:01.000Z') },
      ],
    };

    expect(stableStringify(input)).toBe(
      '{"items":[{"createdAt":"2026-04-16T12:00:00.900Z"},{"createdAt":"2026-04-16T12:00:01.000Z"}]}',
    );
  });

  it('handles primitive values', () => {
    expect(stableStringify('abc')).toBe('"abc"');
    expect(stableStringify(123)).toBe('123');
    expect(stableStringify(true)).toBe('true');
    expect(stableStringify(null)).toBe('null');
  });
});
