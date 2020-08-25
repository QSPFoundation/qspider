/// <reference types="emscripten" />
import { CharsPtr, BufferPtr, Ptr, FunctionPtr, QspCallType } from './types';

type IRType = 'i8' | 'i16' | 'i32' | 'i64' | 'float' | 'double';

export interface QspModule extends EmscriptenModule {
  UTF32ToString(ptr: CharsPtr): string;
  stringToUTF32(str: string, outPtr: CharsPtr, maxBytes?: number): number;
  lengthBytesUTF32(str: string): number;
  getValue(ptr: Ptr, type: IRType): number;
  addFunction(fn: Function, signature: string): FunctionPtr;
  Asyncify: {
    handleSleep(cb: (wakeUp: (ret: number) => void) => void): void;
  };
  _QSPInit(): void;
  _qspInitCallBacks(): void;
  _qspSetCallBack(type: QspCallType, fnPtr: FunctionPtr): void;
  _QSPGetVersion(): CharsPtr;
  _QSPLoadGameWorld(data: BufferPtr, size: number, fileName: CharsPtr, isNewGame: boolean): boolean;
  _QSPSaveGame(count: IntPointer): CharsPtr;
  _QSPOpenSavedGame(data: BufferPtr, size: number): boolean;
  _QSPRestartGame(): boolean;
  _QSPGetLastError(): Ptr;
  _QSPIsMainDescChanged(): boolean;
  _QSPGetMainDesc(): CharsPtr;
  _QSPIsVarsDescChanged(): boolean;
  _QSPGetVarsDesc(): CharsPtr;
  _QSPIsActionsChanged(): boolean;
  _QSPGetActions(count: IntPointer): Ptr;
  _QSPSelectAction(index: number): boolean;
  _QSPIsObjectsChanged(): boolean;
  _QSPGetObjects(count: IntPointer): Ptr;
  _QSPSelectObject(index: number): boolean;
  _QSPGetVarValuesCount(name: CharsPtr): number;
  _QSPGetVarNumValue(name: CharsPtr, index: number): number;
  _QSPGetVarStrValue(name: CharsPtr, index: number): CharsPtr;
  _QSPExecString(code: CharsPtr): boolean;
  _QSPExecCounter(): boolean;
  _QSPExecUserInput(code: CharsPtr): boolean;
}

export default function Module(emscriptenArgs: any): Promise<QspModule>;
