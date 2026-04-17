# nestjs-revalidate

Declarative HTTP revalidation for NestJS.

`nestjs-revalidate` helps NestJS endpoints speak proper HTTP using decorators instead of manual header handling. It adds support for `ETag`, `Last-Modified`, conditional requests, and `304 Not Modified` responses for both Express and Fastify.

## Status

Early stage / work in progress.

The package is under active development and the API may still change.
It is not published to npm yet.

## Why

Many NestJS applications return the same JSON again and again even when nothing changed.

Without a dedicated abstraction, developers often end up writing manual logic in controllers:

- compute `ETag`
- set headers
- read `If-None-Match`
- compare values
- return `304 Not Modified`
- repeat the same pattern for multiple endpoints

This package moves that logic into decorators and interceptor-based runtime handling.

## What it does

- declarative `ETag`
- declarative `Last-Modified`
- `If-None-Match` handling
- `If-Modified-Since` handling
- `304 Not Modified`
- `Cache-Control`
- `Vary`
- Express support
- Fastify support

## What it is not

`nestjs-revalidate` is **not**:

- a Redis cache
- a memory response cache
- an invalidation engine
- a CDN integration layer
- a storage-backed cache manager replacement

This package is focused on **HTTP revalidation semantics**, not cache storage.

## Example

```ts
@Get(':id')
@HttpCache({
  etag: (user) => user.version,
  lastModified: (user) => user.updatedAt,
  cacheControl: 'private, max-age=0, must-revalidate',
  vary: ['Accept-Encoding'],
})
findOne(@Param('id') id: string) {
  return this.usersService.findById(id);
}