const supportedFileTypes = ['.qsp', '.qsps', '.aqsp', '.zip', '.rar'];
export function isSupportedFileType(path: string): boolean {
  return supportedFileTypes.some((ext) => path.endsWith(ext));
}
