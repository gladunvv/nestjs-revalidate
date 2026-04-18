export type RevalidateProjectorErrorMode = 'throw' | 'skip';

export interface RevalidateModuleOptions {
  onProjectorError?: RevalidateProjectorErrorMode;
  setHeadersOnNotModified?: boolean;
  etag?: {
    mode?: 'weak' | 'strong';
  };
}
