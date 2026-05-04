import { describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';
import { RevalidateInterceptor } from '../../../src/interceptor/revalidate.interceptor';

describe('RevalidateInterceptor (non-http)', () => {
  it('bypasses interceptor logic when context type is not http', async () => {
    const interceptor = new RevalidateInterceptor({
      onProjectorError: 'throw',
      setHeadersOnNotModified: true,
      etag: { mode: 'weak' },
    });

    const nextHandle = vi.fn().mockReturnValue(of('result'));

    const context = {
      getType: vi.fn().mockReturnValue('rpc'), // 👈 ключевая часть
    } as any;

    const next = {
      handle: nextHandle,
    };

    const result$ = interceptor.intercept(context, next);
    const result = await result$.toPromise();

    expect(nextHandle).toHaveBeenCalled();
    expect(result).toBe('result');
  });