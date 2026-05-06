import { describe, it, expect, vi } from 'vitest';
import { of, lastValueFrom } from 'rxjs';
import { RevalidateInterceptor } from '../../../src/interceptor/revalidate.interceptor';

describe('RevalidateInterceptor', () => {
  it('bypasses interceptor logic when context type is not http', async () => {
    const reflector = {
      get: vi.fn(),
      getAllAndOverride: vi.fn(),
    } as any;

    const adapterHost = {
      httpAdapter: {},
    } as any;

    const interceptor = new RevalidateInterceptor(reflector, adapterHost, {
      onProjectorError: 'throw',
      setHeadersOnNotModified: true,
      etag: { mode: 'weak' },
    });

    const nextHandle = vi.fn().mockReturnValue(of('result'));

    const context = {
      getType: vi.fn().mockReturnValue('rpc'),
    } as any;

    const next = {
      handle: nextHandle,
    };

    const result = await lastValueFrom(interceptor.intercept(context, next));

    expect(nextHandle).toHaveBeenCalled();
    expect(result).toBe('result');
  });

  it('bypasses interceptor logic when metadata is not found', async () => {
    const reflector = {
      get: vi.fn(),
      getAllAndOverride: vi.fn().mockReturnValue(undefined),
    } as any;

    const req = {
      method: 'GET',
      headers: {},
      url: '/test',
    };

    const adapterHost = {
      httpAdapter: {
        getType: vi.fn().mockReturnValue('express'),
        getRequestMethod: vi.fn().mockImplementation((r) => r.method),
      },
    } as any;

    const interceptor = new RevalidateInterceptor(reflector, adapterHost, {
      onProjectorError: 'throw',
      setHeadersOnNotModified: true,
      etag: { mode: 'weak' },
    });

    const nextHandle = vi.fn().mockReturnValue(of('result'));

    const context = {
      getType: vi.fn().mockReturnValue('http'),
      getHandler: vi.fn().mockReturnValue(() => {}),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: () => req,
      }),
      getClass: vi.fn().mockReturnValue(() => {}),
    } as any;

    const next = {
      handle: nextHandle,
    };

    const result = await lastValueFrom(interceptor.intercept(context, next));

    expect(nextHandle).toHaveBeenCalled();
    expect(result).toBe('result');
  });
});
