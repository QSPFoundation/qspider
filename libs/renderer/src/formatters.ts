const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const byteSize = 1024;

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const sizeIndex = Math.floor(Math.log(bytes) / Math.log(byteSize));
  return parseFloat((bytes / Math.pow(byteSize, sizeIndex)).toFixed(decimals)) + ' ' + sizes[sizeIndex];
}
