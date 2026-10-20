const supportedFileTypes = ['.qsp', '.qsps', '.gam', '.aqsp', '.zip', '.rar', '.cfg'];
export function isSupportedFileType(path: string): boolean {
  return supportedFileTypes.some((ext) => path.endsWith(ext));
}
