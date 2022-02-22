export const QSP_CODREMOV = 5;
const QSP_STRSDELIM = '\r\n';
export const QSP_GAMEID = 'QSPGAME';
export const QSP_PASSWD = 'No';

export class QspByteStream {
  private cursor = 0;
  private content: ArrayBuffer;
  private view: DataView;

  public constructor(fromBuffer?: ArrayBuffer) {
    this.content = fromBuffer || new ArrayBuffer(256);
    this.view = new DataView(this.content);
  }

  private ensureSize(size: number): void {
    if (this.content.byteLength >= size) return;
    const newLength = this.content.byteLength * 2;
    const buffer = new ArrayBuffer(newLength);
    new Uint8Array(buffer).set(new Uint8Array(this.content));
    this.content = buffer;
    this.view = new DataView(this.content);
  }

  public finalize(): ArrayBuffer {
    this.content = this.content.slice(0, this.cursor);
    return this.content;
  }

  public get eof(): boolean {
    return this.cursor >= this.content.byteLength;
  }

  public read(): number {
    const position = this.cursor;
    this.cursor += Int16Array.BYTES_PER_ELEMENT;
    return this.view.getUint16(position, true);
  }

  public readLine(shouldDecode = true): string {
    const chars: number[] = [];
    while (!this.eof) {
      const char = this.read();
      if (char === 0x0d) {
        this.read();
        break;
      }
      if (shouldDecode) {
        chars.push(char === -QSP_CODREMOV ? QSP_CODREMOV : char + QSP_CODREMOV);
      } else {
        chars.push(char);
      }
    }
    // eslint-disable-next-line prefer-spread
    return String.fromCharCode.apply(String, chars);
  }

  public write(value: number): void {
    this.ensureSize(this.cursor + Int16Array.BYTES_PER_ELEMENT);
    const position = this.cursor;
    this.cursor += Int16Array.BYTES_PER_ELEMENT;
    this.view.setUint16(position, value, true);
  }

  public writeString(input: string, shouldEncode = true): void {
    const charCodes = input.split('').map((char): number => char.charCodeAt(0));
    for (const point of charCodes.values()) {
      if (shouldEncode) {
        this.write(point === QSP_CODREMOV ? -QSP_CODREMOV : point - QSP_CODREMOV);
      } else {
        this.write(point);
      }
    }
  }

  public writeLine(input: string, shouldEncode = true): void {
    input && this.writeString(input, shouldEncode);
    this.writeString(QSP_STRSDELIM, false);
  }

  public tell(): number {
    return this.cursor;
  }

  public seek(offset: number): void {
    this.cursor = offset;
  }

  public skip(offset: number): void {
    this.cursor += offset;
  }
}
