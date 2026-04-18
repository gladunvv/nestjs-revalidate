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
  onProjectorError?: 'throw' | 'skip';
}

export function evaluateRevalidation<T>({
  value,
  metadata,
  context,
  defaultEtagMode = 'weak',
  onProjectorError = 'throw',
}: EvaluateRevalidationInput<T>): RevalidationDecision {
  const headers: RevalidationDecision['headers'] = {};

  if (metadata.noStore) {
    headers.cacheControl = 'no-store';
  } else if (metadata.cacheControl) {
    if (typeof metadata.cacheControl === 'function') {
      const factory = metadata.cacheControl;

      const cacheControl = executeProjector(() => factory(value, context), onProjectorError);

      if (cacheControl !== undefined) {
        headers.cacheControl = cacheControl;
      }
    } else {
      headers.cacheControl = metadata.cacheControl;
    }
  }

  if (metadata.vary?.length) {
    headers.vary = metadata.vary.join(', ');
  }

  let currentEtag: string | undefined;

  if (metadata.etag?.by) {
    const projector = metadata.etag.by;
    const mode = metadata.etag.mode ?? defaultEtagMode;

    const etagInput = executeProjector(() => projector(value, context), onProjectorError);

    if (etagInput !== undefined) {
      currentEtag = createEtag(etagInput, mode);

      if (currentEtag !== undefined) {
        headers.etag = currentEtag;
      }
    }
  }

  let currentLastModifiedDate: Date | undefined;
  if (metadata.lastModified) {
    const projector = metadata.lastModified;

    currentLastModifiedDate = normalizeLastModified(
      executeProjector(() => projector(value, context), onProjectorError),
    );

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

function executeProjector<T>(projector: () => T, mode: 'throw' | 'skip'): T | undefined {
  try {
    return projector();
  } catch (error: unknown) {
    if (mode === 'throw') {
      throw error;
    }

    return undefined;
  }
}

function asSingleHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
