/// <reference types="emscripten" />
import { CharsPtr, BufferPtr, Ptr } from './types';

type IRType = 'i8' | 'i16' | 'i32' | 'i64' | 'float' | 'double';

export interface QspModule extends EmscriptenModule {
  UTF32ToString(ptr: CharsPtr): string;
  stringToUTF32(str: string): CharsPtr;
  getValue(ptr: Ptr, type: IRType): number;
  _QSPGetVersion(): CharsPtr;
  _QSPLoadGameWorld(data: BufferPtr, size: number, fileName: CharsPtr): boolean;
  _QSPGetLastError(): Ptr;
}

export default function Module(emscriptenArgs: any): QspModule;
