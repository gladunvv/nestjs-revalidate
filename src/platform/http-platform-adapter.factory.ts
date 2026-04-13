import { HttpAdapterHost } from '@nestjs/core';
import { FastifyPlatformAdapter } from './fastify-platform-adapter';
import { ExpressPlatformAdapter } from './express-platform-adapter';
import { HttpPlatformAdapter } from './http-platform-adapter';

export function createHttpPlatformAdapter(host: HttpAdapterHost): HttpPlatformAdapter {
  const type = host.httpAdapter.getType();

  if (type === 'fastify') {
    return new FastifyPlatformAdapter();
  }

  return new ExpressPlatformAdapter();
}
