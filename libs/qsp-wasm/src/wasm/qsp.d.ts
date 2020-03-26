/// <reference types="emscripten" />
import { CharsPtr } from './types';

export interface QspModule extends EmscriptenModule {
  UTF32ToString(ptr: CharsPtr): string;
  _QSPGetVersion(): CharsPtr;
}

export default function Module(emscriptenArgs: any): QspModule;
