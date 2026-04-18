# nestjs-revalidate

Declarative HTTP revalidation for NestJS.

`nestjs-revalidate` helps NestJS endpoints use proper HTTP revalidation semantics with decorators instead of manual header handling in controllers.

It supports:

- `ETag`
- `Last-Modified`
- `If-None-Match`
- `If-Modified-Since`
- `304 Not Modified`
- `Cache-Control`
- `Vary`

Works with both **Express** and **Fastify**.

> Pre-release: the package is still being finalized and may change before the first public npm release.

## What this package is for

A common pattern in NestJS apps looks like this:

- fetch resource
- compute `ETag`
- set headers
- read `If-None-Match`
- compare validators
- return `304` when nothing changed

Without a reusable abstraction, this logic usually ends up duplicated across controllers.

`nestjs-revalidate` moves that logic into decorators and a single interceptor-driven runtime path.

## What this package is not

This package is **not**:

- a Redis cache
- a memory response cache
- an invalidation system
- a `cache-manager` replacement

It focuses on **HTTP revalidation**, not cache storage.

## Installation

After publishing:

```bash
npm install nestjs-revalidate
```

Peer dependencies:

- `@nestjs/common`
- `@nestjs/core`
- `reflect-metadata`
- `rxjs`

## Quick start

Register the module once:

```ts
import { Module } from '@nestjs/common';
import { RevalidateModule } from 'nestjs-revalidate';

@Module({
  imports: [
    RevalidateModule.forRoot({
      etag: {
        mode: 'weak',
      },
      onProjectorError: 'throw',
      setHeadersOnNotModified: true,
    }),
  ],
})
export class AppModule {}
```

Use `@HttpCache(...)` on `GET` or `HEAD` endpoints:

```ts
import { Controller, Get, Param } from '@nestjs/common';
import { HttpCache } from 'nestjs-revalidate';

interface UserDto {
  id: string;
  version: number;
  updatedAt: Date;
  name: string;
}

@Controller('users')
export class UsersController {
  @Get(':id')
  @HttpCache<UserDto>({
    etag: (user) => user.version,
    lastModified: (user) => user.updatedAt,
    cacheControl: 'private, max-age=0, must-revalidate',
    vary: ['Accept-Encoding'],
  })
  findOne(@Param('id') id: string): UserDto {
    return {
      id,
      version: 7,
      updatedAt: new Date('2026-04-16T12:00:00.000Z'),
      name: 'Alex',
    };
  }
}
```

## Low-level decorators

You can also compose the behavior explicitly:

```ts
import { Controller, Get, Param } from '@nestjs/common';
import {
  EtagBy,
  LastModifiedBy,
  CacheControl,
  Vary,
} from 'nestjs-revalidate';

interface UserDto {
  id: string;
  version: number;
  updatedAt: Date;
  name: string;
}

@Controller('users')
export class UsersController {
  @Get(':id')
  @EtagBy((user: UserDto) => user.version)
  @LastModifiedBy((user: UserDto) => user.updatedAt)
  @CacheControl('private, max-age=0, must-revalidate')
  @Vary('Accept-Encoding')
  findOne(@Param('id') id: string): UserDto {
    return {
      id,
      version: 7,
      updatedAt: new Date('2026-04-16T12:00:00.000Z'),
      name: 'Alex',
    };
  }
}
```

## Public API

### `@HttpCache(options)`

High-level decorator that combines multiple revalidation settings.

```ts
@HttpCache({
  etag: (value) => value.version,
  lastModified: (value) => value.updatedAt,
  cacheControl: 'private, max-age=0, must-revalidate',
  vary: ['Accept-Encoding'],
})
```

### `@EtagBy(projector, mode?)`

Defines how to compute the resource validator used for `ETag`.

```ts
@EtagBy((value) => value.version)
```

### `@LastModifiedBy(projector)`

Defines how to compute `Last-Modified`.

```ts
@LastModifiedBy((value) => value.updatedAt)
```

### `@CacheControl(value)`

Sets `Cache-Control` for the endpoint.

```ts
@CacheControl('private, max-age=0, must-revalidate')
```

### `@Vary(...headers)`

Sets the `Vary` header.

```ts
@Vary('Accept-Encoding', 'Accept-Language')
```

### `@NoStore()`

Forces `Cache-Control: no-store`.

```ts
@NoStore()
```

## Module options

```ts
export type RevalidateProjectorErrorMode = 'throw' | 'skip';

export interface RevalidateModuleOptions {
  onProjectorError?: RevalidateProjectorErrorMode;
  setHeadersOnNotModified?: boolean;
  etag?: {
    mode?: 'weak' | 'strong';
  };
}
```

### `onProjectorError`

Controls what happens when a projector throws.

- `'throw'`: propagate the error
- `'skip'`: ignore the failing projector and continue with the rest

Example:

```ts
RevalidateModule.forRoot({
  onProjectorError: 'skip',
})
```

### `setHeadersOnNotModified`

Controls whether computed headers are included on `304 Not Modified` responses.

- `true`: include computed headers on `304`
- `false`: omit them on `304`

Example:

```ts
RevalidateModule.forRoot({
  setHeadersOnNotModified: true,
})
```

### `etag.mode`

Configures the default `ETag` mode.

- `'weak'`
- `'strong'`

Example:

```ts
RevalidateModule.forRoot({
  etag: {
    mode: 'weak',
  },
})
```

## Runtime behavior

For `GET` and `HEAD` requests, the interceptor:

1. executes the route handler
2. computes validators from the returned value
3. reads conditional request headers
4. decides whether the resource changed
5. sets response headers
6. returns `304 Not Modified` when appropriate

For non-`GET`/`HEAD` requests, revalidation logic is skipped.

## Supported platforms

- NestJS + Express
- NestJS + Fastify

## Current scope

The package intentionally stays small.

Current focus:

- predictable `ETag` behavior
- predictable `Last-Modified` behavior
- correct `304` handling
- Express/Fastify support
- small and explicit API surface

## Limitations

Current limitations and expectations:

- designed for `GET` and `HEAD`
- not intended as a storage-backed cache
- does not automatically invalidate data after writes
- does not eliminate database work by itself
- not intended for streaming or file-specific behavior in its current form

## Testing

The project currently includes:

- unit tests for core revalidation logic
- metadata and decorator tests
- e2e tests for Express
- e2e tests for Fastify

## License

MIT
