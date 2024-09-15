const supportedFileTypes = ['.qsp', '.qsps', '.gam', '.aqsp', '.zip', '.rar'];
export function isSupportedFileType(path: string): boolean {
  return supportedFileTypes.some((ext) => path.endsWith(ext));
}
