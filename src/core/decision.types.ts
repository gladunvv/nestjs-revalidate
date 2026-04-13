export interface EvaluatedHeaders {
  etag?: string;
  lastModified?: string;
  cacheControl?: string;
  vary?: string;
}

export interface RevalidationDecision {
  notModified: boolean;
  headers: EvaluatedHeaders;
}
