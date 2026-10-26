import { cleanPath, isExternalUrl } from '@qspider/utils';

/** An external URL is used as written; a game path gets its backslashes turned into slashes. */
export function imgSrc(src: string): string {
  return isExternalUrl(src) ? src : cleanPath(src);
}
