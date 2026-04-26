# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-04-26

### Added
- Added HEAD request support and e2e coverage for Express and Fastify.
- Added e2e coverage for:
  - changed ETag scenarios
  - `HttpCache`
  - `POST` bypass
- Added unit coverage for:
  - `createEtag`
  - `stableStringify`
  - `If-Modified-Since` second-level precision

### Changed
- Improved `If-Modified-Since` comparison to use second precision.

### Fixed
- Fixed response lifecycle issues around `304 Not Modified`.
- Fixed metadata merge behavior for separate decorator keys.
- Fixed conditional revalidation handling for Express and Fastify parity.

## [0.1.0] - 2026-04-19

### Added
- Initial public release.
- Declarative HTTP revalidation for NestJS.
- Support for:
  - `ETag`
  - `Last-Modified`
  - `Cache-Control`
  - `Vary`
  - `304 Not Modified`
- Decorators:
  - `@HttpCache`
  - `@EtagBy`
  - `@LastModifiedBy`
  - `@CacheControl`
  - `@Vary`
  - `@NoStore`
- Express and Fastify adapters.