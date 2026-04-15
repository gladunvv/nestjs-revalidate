import { HttpCacheExecutionContext, RevalidateRouteMetadata } from '../metadata/metadata.types';
import { RevalidationDecision } from './decision.types';
import { createEtag } from './etag/create-etag';
import { matchesIfNoneMatch } from './etag/match-if-none-match';
import { normalizeLastModified } from './last-modified/normalize-last-modified';
import { matchesIfModifiedSince } from './last-modified/match-if-modified-since';
import { toHttpDate } from '../utils/to-http-date';

export interface EvaluateRevalidationInput<T = unknown> {
  value: T;
  metadata: RevalidateRouteMetadata<T>;
  context: HttpCacheExecutionContext;
  defaultEtagMode?: 'weak' | 'strong';
}

export function evaluateRevalidation<T>({
  value,
  metadata,
  context,
  defaultEtagMode = 'weak',
}: EvaluateRevalidationInput<T>): RevalidationDecision {
  const headers: RevalidationDecision['headers'] = {};

  if (metadata.noStore) {
    headers.cacheControl = 'no-store';
  } else if (metadata.cacheControl) {
    const cacheControl =
      typeof metadata.cacheControl === 'function'
        ? metadata.cacheControl(value, context)
        : metadata.cacheControl;

    if (cacheControl !== undefined) {
      headers.cacheControl = cacheControl;
    }
  }
//TODO: Implement VaryFactory (vary with factory)
  // if (metadata.vary) {
  //   const varyValue =
  //     typeof metadata.vary === 'function' ? metadata.vary(value, context) : metadata.vary;

  //   if (varyValue?.length) {
  //     headers.vary = varyValue.join(', ');
  //   }
  // }

  if (metadata.vary) {
    headers.vary = metadata.vary.join(', ');
  }

  let currentEtag: string | undefined;
  if (metadata.etag?.by) {
    const etagInput = metadata.etag.by(value, context);
    currentEtag = createEtag(etagInput, metadata.etag.mode ?? defaultEtagMode);
    if (currentEtag) {
      headers.etag = currentEtag;
    }
  }

  let currentLastModifiedDate: Date | undefined;
  if (metadata.lastModified) {
    currentLastModifiedDate = normalizeLastModified(metadata.lastModified(value, context));
    if (currentLastModifiedDate) {
      headers.lastModified = toHttpDate(currentLastModifiedDate);
    }
  }

  const ifNoneMatch = asSingleHeader(context.headers['if-none-match']);
  const ifModifiedSince = asSingleHeader(context.headers['if-modified-since']);

  const etagMatched = matchesIfNoneMatch(currentEtag, ifNoneMatch);
  const lastModifiedMatched = matchesIfModifiedSince(currentLastModifiedDate, ifModifiedSince);

  const notModified = etagMatched || (!currentEtag && lastModifiedMatched);

  return {
    notModified,
    headers,
  };
}

function asSingleHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
