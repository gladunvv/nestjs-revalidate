import { ExecutionContext } from '@nestjs/common';
import { HttpPlatformAdapter } from './http-platform-adapter';

export class ExpressPlatformAdapter implements HttpPlatformAdapter {
  getRequestMethod(context: ExecutionContext): string {
    const req = context.switchToHttp().getRequest();
    return req.method;
  }

  getRequestUrl(context: ExecutionContext): string | undefined {
    const req = context.switchToHttp().getRequest();
    return req.originalUrl ?? req.url;
  }

  getRequestHeaders(context: ExecutionContext): Record<string, string | string[] | undefined> {
    const req = context.switchToHttp().getRequest();
    return req.headers ?? {};
  }

  setHeader(context: ExecutionContext, name: string, value: string): void {
    const res = context.switchToHttp().getResponse();
    res.setHeader(name, value);
  }

  replyNotModified(context: ExecutionContext): void {
    const res = context.switchToHttp().getResponse();
    res.status(304);
  }
}
