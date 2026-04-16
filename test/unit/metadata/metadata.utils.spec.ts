import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { EtagBy } from '../../../src/decorators/etag-by.decorator';
import { CacheControl } from '../../../src/decorators/cache-control.decorator';
import { NoStore } from '../../../src/decorators/no-store.decorator';
import { HttpCache } from '../../../src/decorators/http-cache.decorator';
import { getMergedRevalidateMetadata } from '../../../src/metadata/metadata.utils';

describe('getMergedRevalidateMetadata', () => {
  function createContext(cls: new (...args: any[]) => any, handlerName: string): ExecutionContext {
    return {
      getClass: () => cls,
      getHandler: () => cls.prototype[handlerName],
    } as ExecutionContext;
  }

  it('returns undefined when no metadata is present', () => {
    class TestController {
      handler() {}
    }

    const reflector = new Reflector();
    const context = createContext(TestController, 'handler');

    const metadata = getMergedRevalidateMetadata(reflector, context);

    expect(metadata).toBeUndefined();
  });

  it('merges controller-level and method-level metadata', () => {
    const projector = (value: { version: number }) => value.version;

    @CacheControl('private, max-age=0, must-revalidate')
    class TestController {
      @EtagBy(projector, 'weak')
      handler() {}
    }

    const reflector = new Reflector();
    const context = createContext(TestController, 'handler');

    const metadata = getMergedRevalidateMetadata(reflector, context);

    expect(metadata).toEqual({
      etag: {
        by: projector,
        mode: 'weak',
      },
      cacheControl: 'private, max-age=0, must-revalidate',
    });
  });

  it('method metadata overrides controller metadata', () => {
    const classProjector = (value: { version: number }) => value.version;
    const methodProjector = (value: { revision: number }) => value.revision;

    @CacheControl('private, max-age=60')
    @EtagBy(classProjector, 'weak')
    class TestController {
      @CacheControl('no-cache')
      @EtagBy(methodProjector, 'strong')
      handler() {}
    }

    const reflector = new Reflector();
    const context = createContext(TestController, 'handler');

    const metadata = getMergedRevalidateMetadata(reflector, context);

    expect(metadata).toEqual({
      etag: {
        by: methodProjector,
        mode: 'strong',
      },
      cacheControl: 'no-cache',
    });
  });

  it('preserves multiple metadata pieces on one handler', () => {
    const projector = (value: { version: number }) => value.version;

    class TestController {
      @EtagBy(projector)
      @NoStore()
      handler() {}
    }

    const reflector = new Reflector();
    const context = createContext(TestController, 'handler');

    const metadata = getMergedRevalidateMetadata(reflector, context);

    expect(metadata).toEqual({
      etag: {
        by: projector,
      },
      noStore: true,
    });
  });

  it('reads metadata written by HttpCache decorator', () => {
    type Resource = {
      version: number;
      updatedAt: Date;
    };
    const projector = (value: Resource) => value.version;
    const lastModified = (value: Resource) => value.updatedAt;

    class TestController {
      @HttpCache({
        etag: projector,
        lastModified,
        cacheControl: 'private, max-age=0, must-revalidate',
        vary: ['Accept-Encoding'],
        noStore: true,
      })
      handler() {}
    }

    const reflector = new Reflector();
    const context = createContext(TestController, 'handler');

    const metadata = getMergedRevalidateMetadata(reflector, context);

    expect(metadata).toEqual({
      etag: {
        by: projector,
      },
      lastModified,
      cacheControl: 'private, max-age=0, must-revalidate',
      vary: ['Accept-Encoding'],
      noStore: true,
    });
  });
});
