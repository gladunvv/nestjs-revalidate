import { describe, it, expect, vi } from 'vitest';
import { of, lastValueFrom } from 'rxjs';
import { RevalidateInterceptor } from '../../../src/interceptor/revalidate.interceptor';

describe('RevalidateInterceptor (non-http)', () => {
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
});
