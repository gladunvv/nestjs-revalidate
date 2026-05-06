import { describe, it, expect } from 'vitest';
import { ExpressPlatformAdapter } from '../../../src/platform/express-platform-adapter';

describe('ExpressPlatformAdapter', () => {
  const adapter = new ExpressPlatformAdapter();

  function createContext(req: any) {
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as any;
  }

  describe('getRequestUrl', () => {
    it('returns originalUrl when present', () => {
      const context = createContext({
        originalUrl: '/original',
        url: '/fallback',
      });

      const result = adapter.getRequestUrl(context);

      expect(result).toBe('/original');
    });

    it('falls back to url when originalUrl is missing', () => {
      const context = createContext({
        url: '/fallback',
      });

      const result = adapter.getRequestUrl(context);

      expect(result).toBe('/fallback');
    });
  });

  describe('getRequestHeaders', () => {
    it('returns request headers when present', () => {
      const headers = {
        'if-none-match': '"abc"',
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
