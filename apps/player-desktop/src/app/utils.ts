// `.cfg` is accepted here so that importDesktop can reject any config other than game.cfg with a clear error.
const supportedFileTypes = ['.qsp', '.qsps', '.gam', '.aqsp', '.zip', '.rar', '.cfg'];
export function isSupportedFileType(path: string): boolean {
  const lower = path.toLowerCase();
  return supportedFileTypes.some((ext) => lower.endsWith(ext));
}
