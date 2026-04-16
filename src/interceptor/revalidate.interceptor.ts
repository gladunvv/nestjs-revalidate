import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector, HttpAdapterHost } from '@nestjs/core';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { getMergedRevalidateMetadata } from '../metadata/metadata.utils';
import { evaluateRevalidation } from '../core/evaluate-revalidation';
import { createHttpPlatformAdapter } from '../platform/http-platform-adapter.factory';
import { REVALIDATE_MODULE_OPTIONS } from '../module/revalidate.constants';
import { RevalidateModuleOptions } from '../module/revalidate.interfaces';

@Injectable()
export class RevalidateInterceptor implements NestInterceptor {
  constructor(
    @Inject(Reflector)
    private readonly reflector: Reflector,
    @Inject(HttpAdapterHost)
    private readonly adapterHost: HttpAdapterHost,
    @Inject(REVALIDATE_MODULE_OPTIONS)
    private readonly options: RevalidateModuleOptions,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const adapter = createHttpPlatformAdapter(this.adapterHost);
    const method = adapter.getRequestMethod(context);

    if (method !== 'GET' && method !== 'HEAD') {
      return next.handle();
    }

    const metadata = getMergedRevalidateMetadata(this.reflector, context);
    if (!metadata) {
      return next.handle();
    }

    return next.handle().pipe(
      mergeMap((value) => {
        const requestContext = {
          method,
          url: adapter.getRequestUrl(context),
          headers: adapter.getRequestHeaders(context),
        };

        const decision = evaluateRevalidation({
          value,
          metadata,
          context: requestContext,
          defaultEtagMode: this.options.etag?.mode ?? 'weak',
        });

        if (decision.headers.cacheControl) {
          adapter.setHeader(context, 'Cache-Control', decision.headers.cacheControl);
        }

        if (decision.headers.vary) {
          adapter.setHeader(context, 'Vary', decision.headers.vary);
        }

        if (decision.headers.etag) {
          adapter.setHeader(context, 'ETag', decision.headers.etag);
        }

        if (decision.headers.lastModified) {
          adapter.setHeader(context, 'Last-Modified', decision.headers.lastModified);
        }

        if (decision.notModified) {
          adapter.replyNotModified(context);
          return of(null);
        }

        return of(value);
      }),
    );
  }
}
