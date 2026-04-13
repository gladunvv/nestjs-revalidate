import { ExecutionContext } from '@nestjs/common';

export interface HttpPlatformAdapter {
  getRequestMethod(context: ExecutionContext): string;
  getRequestUrl(context: ExecutionContext): string | undefined;
  getRequestHeaders(context: ExecutionContext): Record<string, string | string[] | undefined>;
  setHeader(context: ExecutionContext, name: string, value: string): void;
  replyNotModified(context: ExecutionContext): void;
}
