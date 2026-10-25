/** UTF-16LE when the bytes start with its BOM (old files written on Windows), otherwise UTF-8. */
export function decodeText(data: Uint8Array | ArrayBuffer): string {
  const bytes = ArrayBuffer.isView(data) ? data : new Uint8Array(data);
  const encoding = bytes[0] === 255 && bytes[1] === 254 ? 'utf-16le' : 'utf-8';
  return new TextDecoder(encoding).decode(bytes);
}
