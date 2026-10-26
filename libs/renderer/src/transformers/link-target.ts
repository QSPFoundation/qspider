export type LinkTarget = { kind: 'exec'; code: string } | { kind: 'action'; number: number } | { kind: 'link' };

/**
 * What an `<a href>` in game text does: `exec:` runs the rest as QSP code, a leading positive number selects that
 * action, anything else (including no href) is a plain link.
 */
export function linkTarget(href: string | undefined): LinkTarget {
  if (href) {
    if (href.toLowerCase().startsWith('exec:')) {
      return { kind: 'exec', code: href.substring(5) };
    }
    if (parseInt(href) > 0) {
      return { kind: 'action', number: parseInt(href) };
    }
  }
  return { kind: 'link' };
}
