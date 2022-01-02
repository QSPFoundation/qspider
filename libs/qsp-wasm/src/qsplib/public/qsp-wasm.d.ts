/// <reference types="emscripten" />
import { CharsPtr, BufferPtr, Ptr, FunctionPtr, QspCallType, Bool, StringPtr, IntPtr } from './types';

type IRType = 'i8' | 'i16' | 'i32' | 'i64' | 'float' | 'double';

export interface QspModule extends EmscriptenModule {
  UTF32ToString(ptr: CharsPtr, maxBytesToRead?: number): string;
  stringToUTF32(str: string, outPtr: CharsPtr, maxBytes?: number): number;
  lengthBytesUTF32(str: string): number;
  getValue(ptr: Ptr, type: IRType): number;
  addFunction(fn: Function, signature: string): FunctionPtr; //eslint-disable-line @typescript-eslint/ban-types
  Asyncify: {
    handleSleep(cb: (wakeUp: (ret: number) => void) => void): void;
  };

  _freeString(string: CharsPtr): void;
  _freeItemsList(items: Ptr): void;
  _freeSaveBuffer(buffer: Prt): void;

  // libqsp
  _init(): void;
  _dispose(): void;

  _setErrorCallback(fnPtr: FunctionPtr): void;

  _getVersion(ptr: Ptr): void;

  _getMainDesc(ptr: Ptr): void;
  _isMainDescChanged(): Bool;

  _getVarsDesc(ptr: Ptr): void;
  _isVarsDescChanged(): Bool;

  _getActions(list: Ptr): number;
  _selectAction(index: number): void;
  _executeSelAction(): void;
  _isActionsChanged(): Bool;

  _getObjects(list: Ptr): number;
  _selectObject(index: number): void;
  _isObjectsChanged(): Bool;

  _loadGameData(data: BufferPtr, size: number, isNewGame: Bool): void;
  _restartGame(): void;
  _saveGameData(realSize: IntPtr): Ptr;
  _loadSavedGameData(data: BufferPtr, size: number): void;

  _execString(input: CharsPtr): void;
  _execCounter(): void;
  _execUserInput(input: CharsPtr): void;
  _execLoc(input: CharsPtr): void;

  _getLastErrorData(errorNum: IntPtr, errorLoc: StringPtr, errorActIndex: IntPtr, errorLine: IntPtr): void;
  _getErrorDesc(ptr: Ptr, errorNum: number): void;

  _getVarStringValue(name: CharsPrt, index: number, result: Ptr): void;
  _getVarNumValue(name: CharsPtr, index: number): number;

  _initCallBacks(): void;
  _setCallBack(type: QspCallType, fnPtr: FunctionPtr): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Module(emscriptenArgs: any): Promise<QspModule>;
