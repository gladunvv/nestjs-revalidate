import { ExecutionContext } from '@nestjs/common';
import { HttpPlatformAdapter } from './http-platform-adapter';

export class FastifyPlatformAdapter implements HttpPlatformAdapter {
  getRequestMethod(context: ExecutionContext): string {
    const req = context.switchToHttp().getRequest();
    return req.method;
  }

  getRequestUrl(context: ExecutionContext): string | undefined {
    const req = context.switchToHttp().getRequest();
    return req.url;
  }

  getRequestHeaders(context: ExecutionContext): Record<string, string | string[] | undefined> {
    const req = context.switchToHttp().getRequest();
    return req.headers ?? {};
  }

  setHeader(context: ExecutionContext, name: string, value: string): void {
    const reply = context.switchToHttp().getResponse();
    reply.header(name, value);
  }

  setStatusNotModified(context: ExecutionContext): void {
    const reply = context.switchToHttp().getResponse();
    reply.code(304);
  }
}
