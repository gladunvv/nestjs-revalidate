import { describe, it, expect } from 'vitest';
import { FastifyPlatformAdapter } from '../../../src/platform/fastify-platform-adapter';

describe('FastifyPlatformAdapter', () => {
  const adapter = new FastifyPlatformAdapter();

  function createContext(req: any) {
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as any;
  }

  describe('getRequestHeaders', () => {
    it('returns request headers when present', () => {
      const headers = {
        'if-none-match': '"abc"',
        'if-modified-since': 'Mon, 01 Jan 2024 00:00:00 GMT',
      };

      const context = createContext({
        headers,
      });

      const result = adapter.getRequestHeaders(context);

      expect(result).toBe(headers);
    });

    it('returns empty object when headers are missing', () => {
      const context = createContext({});

      const result = adapter.getRequestHeaders(context);

      expect(result).toEqual({});
    });
  });
});
