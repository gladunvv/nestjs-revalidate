export interface HttpCacheExecutionContext {
  method: string;
  url: string | undefined;
  headers: Record<string, string | string[] | undefined>;
}

export type EtagInput =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | Record<string, unknown>
  | Array<unknown>;

export type EtagProjector<T = unknown> = (value: T, ctx: HttpCacheExecutionContext) => EtagInput;

export type LastModifiedProjector<T = unknown> = (
  value: T,
  ctx: HttpCacheExecutionContext,
) => Date | string | number | null | undefined;

export type CacheControlFactory<T = unknown> = (
  value: T,
  ctx: HttpCacheExecutionContext,
) => string | undefined;

export type VaryFactory<T = unknown> = (
  value: T,
  ctx: HttpCacheExecutionContext,
) => string[] | undefined;

export interface HttpCacheOptions<T = unknown> {
  etag?:
    | EtagProjector<T>
    | {
        by: EtagProjector<T>;
        mode?: 'weak' | 'strong';
      };
  lastModified?: LastModifiedProjector<T>;
  cacheControl?: string | CacheControlFactory<T>;
  vary?: string[] | VaryFactory<T>;
  noStore?: boolean;
}

export interface RevalidateRouteMetadata<T = unknown> {
  etag?: {
    by: EtagProjector<T>;
    mode?: 'weak' | 'strong';
  };
  lastModified?: LastModifiedProjector<T>;
  cacheControl?: string | CacheControlFactory<T>;
  vary?: string[] | VaryFactory<T>;
  noStore?: boolean;
}
