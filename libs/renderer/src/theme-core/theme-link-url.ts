/** A theme's css/script link: the `qspider:` prefix stands for the player's base URL, anything else is used as written. */
export function resolveQspiderLink(src: string, baseUrl: string): string {
  return src.startsWith('qspider:') ? src.replace('qspider:', baseUrl) : src;
}
