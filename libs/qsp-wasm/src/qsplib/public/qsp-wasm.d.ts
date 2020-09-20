/// <reference types="emscripten" />
import { CharsPtr, BufferPtr, Ptr, FunctionPtr, QspCallType, Bool, StringPtr, IntPtr } from './types';

type IRType = 'i8' | 'i16' | 'i32' | 'i64' | 'float' | 'double';

export interface QspModule extends EmscriptenModule {
  UTF32ToString(ptr: CharsPtr, maxBytesToRead?: number): string;
  stringToUTF32(str: string, outPtr: CharsPtr, maxBytes?: number): number;
  lengthBytesUTF32(str: string): number;
  getValue(ptr: Ptr, type: IRType): number;
  addFunction(fn: Function, signature: string): FunctionPtr;
  Asyncify: {
    handleSleep(cb: (wakeUp: (ret: number) => void) => void): void;
  };

  _freeString(string: CharsPtr): void;
  _createItemsList(items: Ptr): void;
  _freeItemsList(items: Ptr): void;
  _createSaveBuffer(buffer: Prt, size: number): void;
  _recreateSaveBuffer(buffer: Prt, size: number): void;
  _freeSaveBuffer(buffer: Prt): void;

  // libqsp
  _init(): void;
  _dispose(): void;

  _getVersion(ptr: Ptr): void;

  _getMainDesc(ptr: Ptr): void;
  _isMainDescChanged(): Bool;

  _getVarsDesc(ptr: Ptr): void;
  _isVarsDescChanged(): Bool;

  _getActions(list: Ptr): number;
  _selectAction(index: number): Bool;
  _isActionsChanged(): Bool;

  _getObjects(list: Ptr): number;
  _selectObject(index: number): Bool;
  _isObjectsChanged(): Bool;

  _loadGameData(data: BufferPtr, size: number, isNewGame: Bool): Bool;
  _restartGame(): Bool;
  _saveGameData(buffer: Ptr, size: number, realSize: IntPtr): Bool;
  _loadSavedGameData(data: BufferPtr, size: number): Bool;

  _execString(input: CharsPtr): Bool;
  _execCounter(): Bool;
  _execUserInput(input: CharsPtr): Bool;

  _getLastErrorData(errorNum: IntPtr, errorLoc: StringPtr, errorActIndex: IntPtr, errorLine: IntPtr): void;
  _getErrorDesc(ptr: Ptr, errorNum: number): void;

  _getVarStringValue(ptr: Ptr, name: CharsPrt, index: number): void;
  _getVarNumValue(name: CharsPtr, index: number): number;

  _initCallBacks(): void;
  _setCallBack(type: QspCallType, fnPtr: FunctionPtr): void;
}

export default function Module(emscriptenArgs: any): Promise<QspModule>;
