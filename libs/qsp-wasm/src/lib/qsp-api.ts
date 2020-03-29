import EventEmitter from 'eventemitter3';
import { QspAPI, QspErrorData, QspEvents } from './contracts';
import { QspModule } from '../wasm/qsp';
import { Ptr, CharsPtr } from '../wasm/types';

export class QspAPIImpl implements QspAPI {
  private events = new EventEmitter();

  constructor(private module: QspModule) {}

  on<E extends keyof QspEvents>(event: E, listener: QspEvents[E]): void {
    this.events.on(event, listener);
  }

  off<E extends keyof QspEvents>(event: E, listener: QspEvents[E]): void {
    this.events.off(event, listener);
  }

  createGameWorld(data: ArrayBuffer, fileName: string): boolean {
    const bytes = new Uint8Array(data);
    const ptr = this.module._malloc(bytes.length);
    this.module.HEAPU8.set(bytes, ptr);

    return this.onCalled(
      this.module._QSPLoadGameWorld(
        ptr,
        bytes.length,
        this.module.stringToUTF32(fileName)
      )
    );
  }

  version(): string {
    return this.readString(this.module._QSPGetVersion());
  }

  private emit<
    E extends keyof QspEvents,
    CB extends QspEvents[E] = QspEvents[E]
  >(event: E, ...args: Parameters<CB>): void {
    this.events.emit(event, ...args);
  }

  private onCalled(isSuccessfull: boolean): boolean {
    if (!isSuccessfull) {
      const errorData = this.readError();
      console.log(errorData);
      if (errorData.code > 0) {
        this.emit('error', errorData);
      }
    }
    return isSuccessfull;
  }

  private readString(ptr: CharsPtr): string {
    return this.module.UTF32ToString(ptr);
  }

  private readInt(ptr: Ptr): number {
    return this.module.getValue(ptr, 'i32');
  }

  private readError(): QspErrorData {
    let ptr = this.module._QSPGetLastError();

    const code = this.readInt(ptr);
    ptr = this.movePtr(ptr);

    const descriptionPtr = this.getCharsPtr(ptr);
    const description = this.readString(descriptionPtr);
    ptr = this.movePtr(ptr);

    const locationPtr = this.getCharsPtr(ptr);
    const location = this.readString(locationPtr);
    ptr = this.movePtr(ptr);

    const actionIndex = this.readInt(ptr);
    ptr = this.movePtr(ptr);

    const line = this.readInt(ptr);

    return {
      code,
      location,
      description,
      actionIndex,
      line,
    };
  }

  private getCharsPtr(ptr: Ptr): CharsPtr {
    return this.module.getValue(ptr, 'i32');
  }

  private movePtr(ptr: Ptr): Ptr {
    return ptr + 4; // pointers are 4 bytes in C
  }

  toJSON() {
    return '[QSP API]';
  }
}
