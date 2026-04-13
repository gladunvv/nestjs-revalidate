export type RevalidateProjectorErrorMode = 'throw' | 'skip';

export interface RevalidateModuleOptions {
  debug?: boolean;
  onProjectorError?: RevalidateProjectorErrorMode;
  setHeadersOnNotModified?: boolean;
  etag?: {
    mode?: 'weak' | 'strong';
    hashAlgorithm?: 'sha1';
  };
}
