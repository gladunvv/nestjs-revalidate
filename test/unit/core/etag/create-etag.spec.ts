import { describe, it, expect } from 'vitest';
import { createEtag } from '../../../../src/core/etag/create-etag';
import { sha1 } from '../../../../src/utils/sha1';
import { stableStringify } from '../../../../src/utils/stable-stringify';

describe('createEtag', () => {
  it('returns undefined when input is nullish', () => {
    expect(createEtag(undefined)).toBeUndefined();
    expect(createEtag(null)).toBeUndefined();
  });

  it('returns weak etag for string input by default', () => {
    const input = 'abc';
    const expected = `W/"${sha1(input)}"`;

    expect(createEtag(input)).toBe(expected);
  });

  it('returns weak etag for number input', () => {
    const input = 123;
    const expected = `W/"${sha1(String(input))}"`;

    expect(createEtag(input)).toBe(expected);
  });

  it('returns weak etag for boolean input', () => {
    const input = true;
    const expected = `W/"${sha1(String(input))}"`;

    expect(createEtag(input)).toBe(expected);
  });

  it('returns weak etag for Date input', () => {
    const input = new Date('2026-04-16T12:00:00.900Z');
    const expected = `W/"${sha1(input.toISOString())}"`;

    expect(createEtag(input)).toBe(expected);
  });

  it('returns weak etag for object input', () => {
    const input = { a: 1, b: 'x' };
    const expected = `W/"${sha1(stableStringify(input))}"`;

    expect(createEtag(input)).toBe(expected);
  });

  it('returns weak etag for array input', () => {
    const input = [1, 'x', true];
    const expected = `W/"${sha1(stableStringify(input))}"`;

    expect(createEtag(input)).toBe(expected);
  });

  it('returns the same etag for objects with different key order', () => {
    const first = { a: 1, b: 2 };
    const second = { b: 2, a: 1 };

    expect(createEtag(first)).toBe(createEtag(second));
  });

  it('returns weak etag when mode is weak', () => {
    const input = 'abc';
    const expected = `W/"${sha1(input)}"`;

    expect(createEtag(input, 'weak')).toBe(expected);
  });

  it('returns strong etag when mode is strong', () => {
    const input = 'abc';
    const expected = `"${sha1(input)}"`;

    expect(createEtag(input, 'strong')).toBe(expected);
  });
});
