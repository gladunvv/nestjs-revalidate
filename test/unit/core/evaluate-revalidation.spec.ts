import { describe, it, expect } from 'vitest';
import { evaluateRevalidation } from '../../../src/core/evaluate-revalidation';
import { RevalidateRouteMetadata } from '../../../src/metadata/metadata.types';

describe('evaluateRevalidation', () => {
  const baseContext = {
    method: 'GET',
    url: '/users/1',
    headers: {},
  };

  it('sets ETag header from projector', () => {
    const metadata: RevalidateRouteMetadata<{ version: number }> = {
      etag: {
        by: (value) => value.version,
      },
    };

    const decision = evaluateRevalidation({
      value: { version: 7 },
      metadata,
      context: baseContext,
      defaultEtagMode: 'weak',
    });

    expect(decision.notModified).toBe(false);
    expect(decision.headers.etag).toBeDefined();
    expect(decision.headers.etag?.startsWith('W/"')).toBe(true);
  });

  it('returns 304 decision when If-None-Match matches', () => {
    const metadata: RevalidateRouteMetadata<{ version: number }> = {
      etag: {
        by: (value) => value.version,
      },
    };

    const first = evaluateRevalidation({
      value: { version: 7 },
      metadata,
      context: baseContext,
      defaultEtagMode: 'weak',
    });

    const second = evaluateRevalidation({
      value: { version: 7 },
      metadata,
      context: {
        ...baseContext,
        headers: {
          'if-none-match': first.headers.etag,
        },
      },
      defaultEtagMode: 'weak',
    });

    expect(second.notModified).toBe(true);
    expect(second.headers.etag).toBe(first.headers.etag);
  });

  it('does not return 304 when ETag changes', () => {
    const metadata: RevalidateRouteMetadata<{ version: number }> = {
      etag: {
        by: (value) => value.version,
      },
    };

    const first = evaluateRevalidation({
      value: { version: 7 },
      metadata,
      context: baseContext,
      defaultEtagMode: 'weak',
    });

    const second = evaluateRevalidation({
      value: { version: 8 },
      metadata,
      context: {
        ...baseContext,
        headers: {
          'if-none-match': first.headers.etag,
        },
      },
      defaultEtagMode: 'weak',
    });

    expect(second.notModified).toBe(false);
    expect(second.headers.etag).not.toBe(first.headers.etag);
  });

  it('uses no-store over cacheControl', () => {
    const metadata: RevalidateRouteMetadata = {
      noStore: true,
      cacheControl: 'private, max-age=60',
    };

    const decision = evaluateRevalidation({
      value: {},
      metadata,
      context: baseContext,
      defaultEtagMode: 'weak',
    });

    expect(decision.headers.cacheControl).toBe('no-store');
  });

  it('sets static Vary header', () => {
    const metadata: RevalidateRouteMetadata = {
      vary: ['Accept-Encoding', 'Accept-Language'],
    };

    const decision = evaluateRevalidation({
      value: {},
      metadata,
      context: baseContext,
      defaultEtagMode: 'weak',
    });

    expect(decision.headers.vary).toBe('Accept-Encoding, Accept-Language');
  });

  it('sets Last-Modified header', () => {
    const updatedAt = new Date('2026-04-15T10:00:00.000Z');

    const metadata: RevalidateRouteMetadata<{ updatedAt: Date }> = {
      lastModified: (value) => value.updatedAt,
    };

    const decision = evaluateRevalidation({
      value: { updatedAt },
      metadata,
      context: baseContext,
      defaultEtagMode: 'weak',
    });

    expect(decision.notModified).toBe(false);
    expect(decision.headers.lastModified).toBe(updatedAt.toUTCString());
  });

  it('uses first value when header is array', () => {
    const metadata: RevalidateRouteMetadata = {
      vary: ['X-First', 'X-Second'],
    };

    const decision = evaluateRevalidation({
      value: {},
      metadata,
      context: baseContext,
      defaultEtagMode: 'weak',
    });

    expect(decision.headers.vary).toBe('X-First');
  });

  it('returns 304 by Last-Modified when ETag is absent and If-Modified-Since matches', () => {
    const updatedAt = new Date('2026-04-15T10:00:00.000Z');

    const metadata: RevalidateRouteMetadata<{ updatedAt: Date }> = {
      lastModified: (value) => value.updatedAt,
    };

    const decision = evaluateRevalidation({
      value: { updatedAt },
      metadata,
      context: {
        ...baseContext,
        headers: {
          'if-modified-since': updatedAt.toUTCString(),
        },
      },
      defaultEtagMode: 'weak',
    });

    expect(decision.notModified).toBe(true);
  });

  it('prefers ETag semantics when ETag exists', () => {
    const updatedAt = new Date('2026-04-15T10:00:00.000Z');

    const metadata: RevalidateRouteMetadata<{ version: number; updatedAt: Date }> = {
      etag: {
        by: (value) => value.version,
      },
      lastModified: (value) => value.updatedAt,
    };

    const first = evaluateRevalidation({
      value: { version: 7, updatedAt },
      metadata,
      context: baseContext,
      defaultEtagMode: 'weak',
    });

    const second = evaluateRevalidation({
      value: { version: 8, updatedAt },
      metadata,
      context: {
        ...baseContext,
        headers: {
          'if-none-match': first.headers.etag,
          'if-modified-since': updatedAt.toUTCString(),
        },
      },
      defaultEtagMode: 'weak',
    });

    expect(second.notModified).toBe(false);
  });

  it('uses weak etag mode by default', () => {
    const decision = evaluateRevalidation({
      value: { version: 1 },
      metadata: {
        etag: {
          by: (value: { version: number }) => value.version,
        },
      },
      context: {
        method: 'GET',
        url: '/users/1',
        headers: {},
      },
      defaultEtagMode: 'weak',
    });

    expect(decision.headers.etag).toMatch(/^W\//);
  });

  it('uses strong etag mode when configured', () => {
    const decision = evaluateRevalidation({
      value: { version: 1 },
      metadata: {
        etag: {
          by: (value: { version: number }) => value.version,
        },
      },
      context: {
        method: 'GET',
        url: '/users/1',
        headers: {},
      },
      defaultEtagMode: 'strong',
    });

    expect(decision.headers.etag).toBeDefined();
    expect(decision.headers.etag?.startsWith('W/')).toBe(false);
  });

  it('throws projector errors when onProjectorError is throw', () => {
    expect(() =>
      evaluateRevalidation({
        value: { version: 1 },
        metadata: {
          etag: {
            by: () => {
              throw new Error('boom');
            },
          },
        },
        context: {
          method: 'GET',
          url: '/users/1',
          headers: {},
        },
        defaultEtagMode: 'weak',
        onProjectorError: 'throw',
      }),
    ).toThrow('boom');
  });

  it('skips failing etag projector when onProjectorError is skip', () => {
    const decision = evaluateRevalidation({
      value: { updatedAt: new Date('2026-04-16T12:00:00.000Z') },
      metadata: {
        etag: {
          by: () => {
            throw new Error('boom');
          },
        },
        lastModified: (value: { updatedAt: Date }) => value.updatedAt,
      },
      context: {
        method: 'GET',
        url: '/users/1',
        headers: {},
      },
      defaultEtagMode: 'weak',
      onProjectorError: 'skip',
    });

    expect(decision.headers.etag).toBeUndefined();
    expect(decision.headers.lastModified).toBeDefined();
    expect(decision.notModified).toBe(false);
  });

  it('skips failing cacheControl projector when onProjectorError is skip', () => {
    const decision = evaluateRevalidation({
      value: { version: 1 },
      metadata: {
        etag: {
          by: (value: { version: number }) => value.version,
        },
        cacheControl: () => {
          throw new Error('boom');
        },
      },
      context: {
        method: 'GET',
        url: '/users/1',
        headers: {},
      },
      defaultEtagMode: 'weak',
      onProjectorError: 'skip',
    });

    expect(decision.headers.etag).toBeDefined();
    expect(decision.headers.cacheControl).toBeUndefined();
  });

  it('does not set Cache-Control when cacheControl factory returns undefined', () => {
    const decision = evaluateRevalidation({
      value: { version: 1 },
      metadata: {
        cacheControl: () => undefined,
      },
      context: {
        method: 'GET',
        url: '/users/1',
        headers: {},
      },
      defaultEtagMode: 'weak',
    });

    expect(decision.headers.cacheControl).toBeUndefined();
  });

  it('sets Cache-Control when cacheControl factory returns a value', () => {
    const decision = evaluateRevalidation({
      value: { version: 1 },
      metadata: {
        cacheControl: () => 'private, max-age=60',
      },
      context: {
        method: 'GET',
        url: '/users/1',
        headers: {},
      },
      defaultEtagMode: 'weak',
    });

    expect(decision.headers.cacheControl).toBe('private, max-age=60');
  });
});
