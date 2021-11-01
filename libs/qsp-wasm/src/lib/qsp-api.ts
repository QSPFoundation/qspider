import EventEmitter from 'eventemitter3';
import { QspAPI, QspErrorData, QspEvents, QspListItem, LayoutSettings } from './contracts';
import { QspModule } from '../qsplib/public/qsp-wasm';
import { Ptr, QspCallType, QspPanel, Bool, StringPtr, CharsPtr } from '../qsplib/public/types';
import { shallowEqual } from './helpers';

const POINTER_SIZE = 4; // pointers are 4 bytes in C

export class QspAPIImpl implements QspAPI {
  private events = new EventEmitter();
  private time: number = Date.now();
  private layout: LayoutSettings | null = null;
  private staticStrings: Map<string, Ptr> = new Map();

  constructor(private module: QspModule) {
    this.init();
    this.initStrings();
  }

  on<E extends keyof QspEvents>(event: E, listener: QspEvents[E]): void {
    this.events.on(event, listener);
  }

  off<E extends keyof QspEvents>(event: E, listener: QspEvents[E]): void {
    this.events.off(event, listener);
  }

  openGame(data: ArrayBuffer, isNewGame: boolean): void {
    const bytes = new Uint8Array(data);
    const ptr = this.module._malloc(bytes.length);
    this.module.HEAPU8.set(bytes, ptr);

    this.module._loadGameData(ptr, bytes.length, Number(isNewGame) as Bool);

    this.module._free(ptr);
  }

  saveGame(): ArrayBuffer | null {
    const sizePtr = this.allocPtr();
    const bufferPtr = this.module._saveGameData(sizePtr);
    const size = this.module.getValue(sizePtr, 'i32');
    if (!size) {
      this.onError();
      this.freePtr(sizePtr);
      return null;
    }

    const data = this.module.HEAPU8.slice(bufferPtr, bufferPtr + size);

    this.module._freeSaveBuffer(bufferPtr);
    this.freePtr(sizePtr);

    return data.buffer;
  }

  loadSave(data: ArrayBuffer): void {
    const bytes = new Uint8Array(data);
    const ptr = this.module._malloc(bytes.length);
    this.module.HEAPU8.set(bytes, ptr);
    this.module._loadSavedGameData(ptr, bytes.length);
    this.module._free(ptr);
  }

  restartGame(): void {
    this.time = Date.now();
    this.module._restartGame();
  }

  selectAction(index: number): void {
    this.module._selectAction(index);
  }

  executeSelAction(): void {
    this.module._executeSelAction();
  }

  selectObject(index: number): void {
    this.module._selectObject(index);
  }

  version(): string {
    const ptr = this.allocStrPtr();
    this.module._getVersion(ptr);
    const version = this.readString(ptr);
    this.freePtr(ptr);
    return version;
  }

  readVariableNumber(name: string, index = 0): number {
    let namePtr = this.staticStrings.get(name);
    if (!namePtr) {
      const staticString = this.prepareString(name);
      this.staticStrings.set(name, staticString);
      namePtr = staticString;
    }
    const value = this.module._getVarNumValue(namePtr, index);

    return value;
  }

  readVariableString(name: string, index = 0): string {
    let namePtr = this.staticStrings.get(name);
    if (!namePtr) {
      this.staticStrings.set(name, this.prepareString(name));
      namePtr = this.staticStrings.get(name);
    }
    const resultPtr = this.allocStrPtr();

    this.module._getVarStringValue(namePtr, index, resultPtr);
    const value = this.readString(resultPtr);

    this.freePtr(resultPtr);

    return value;
  }

  execCode(code: string): void {
    const ptr = this.prepareString(code);
    this.module._execString(ptr);
    this.module._free(ptr);
  }

  execCounter(): void {
    this.module._execCounter();
  }

  execLoc(name: string): void {
    const ptr = this.prepareString(name);
    this.module._execLoc(ptr);
    this.module._free(ptr);
  }

  execUserInput(code: string): void {
    const ptr = this.prepareString(code);
    this.module._execUserInput(ptr);
    this.module._free(ptr);
  }

  private init(): void {
    this.module._init();
    this.module._initCallBacks();

    this.registerCallbacks();
  }

  private initStrings(): void {
    this.staticStrings.set('USEHTML', this.prepareString('USEHTML'));
    this.staticStrings.set('BCOLOR', this.prepareString('BCOLOR'));
    this.staticStrings.set('FCOLOR', this.prepareString('FCOLOR'));
    this.staticStrings.set('LCOLOR', this.prepareString('LCOLOR'));
    this.staticStrings.set('FSIZE', this.prepareString('FSIZE'));
    this.staticStrings.set('$FNAME', this.prepareString('$FNAME'));
    this.staticStrings.set('$BACKIMAGE', this.prepareString('$BACKIMAGE'));
    this.staticStrings.set('NOSAVE', this.prepareString('NOSAVE'));
  }

  private registerCallbacks(): void {
    const onError = this.module.addFunction(this.onError, 'i');
    this.module._setErrorCallback(onError);

    const onRefreshInt = this.module.addFunction(this.onRefresh, 'ii');
    this.module._setCallBack(QspCallType.REFRESHINT, onRefreshInt);

    const onShowWindow = this.module.addFunction(this.onShowWindow, 'iii');
    this.module._setCallBack(QspCallType.SHOWWINDOW, onShowWindow);

    const onMenu = this.module.addFunction(this.onMenu, 'iii');
    this.module._setCallBack(QspCallType.SHOWMENU, onMenu);

    const onMsg = this.module.addFunction(this.onMsg, 'ii');
    this.module._setCallBack(QspCallType.SHOWMSGSTR, onMsg);

    const onInput = this.module.addFunction(this.onInput, 'iiii');
    this.module._setCallBack(QspCallType.INPUTBOX, onInput);

    const onWait = this.module.addFunction(this.onWait, 'ii');
    this.module._setCallBack(QspCallType.SLEEP, onWait);

    const onSetTimer = this.module.addFunction(this.onSetTimer, 'ii');
    this.module._setCallBack(QspCallType.SETTIMER, onSetTimer);

    const onSetUserInput = this.module.addFunction(this.onSetUserInput, 'ii');
    this.module._setCallBack(QspCallType.SETINPUTSTRTEXT, onSetUserInput);

    const onView = this.module.addFunction(this.onView, 'ii');
    this.module._setCallBack(QspCallType.SHOWIMAGE, onView);

    const onDebug = this.module.addFunction(this.onDebug, 'ii');
    this.module._setCallBack(QspCallType.DEBUG, onDebug);

    const onGetMS = this.module.addFunction(this.onGetMS, 'i');
    this.module._setCallBack(QspCallType.GETMSCOUNT, onGetMS);

    const onOpenGame = this.module.addFunction(this.onOpenGame, 'iii');
    this.module._setCallBack(QspCallType.OPENGAME, onOpenGame);

    const onOpenGameStatus = this.module.addFunction(this.onOpenGameStatus, 'ii');
    this.module._setCallBack(QspCallType.OPENGAMESTATUS, onOpenGameStatus);

    const onSaveGameStatus = this.module.addFunction(this.onSaveGameStatus, 'ii');
    this.module._setCallBack(QspCallType.SAVEGAMESTATUS, onSaveGameStatus);

    const onIsPLay = this.module.addFunction(this.onIsPlay, 'ii');
    this.module._setCallBack(QspCallType.ISPLAYINGFILE, onIsPLay);

    const onPlayFile = this.module.addFunction(this.onPlayFile, 'iii');
    this.module._setCallBack(QspCallType.PLAYFILE, onPlayFile);

    const onCLoseFile = this.module.addFunction(this.onCloseFile, 'ii');
    this.module._setCallBack(QspCallType.CLOSEFILE, onCLoseFile);

    const onSystemCmd = this.module.addFunction(this.onSystemCmd, 'ii');
    this.module._setCallBack(QspCallType.SYSTEM, onSystemCmd);
  }

  private emit<E extends keyof QspEvents, CB extends QspEvents[E] = QspEvents[E]>(
    event: E,
    ...args: Parameters<CB>
  ): void {
    if (event !== 'refresh') {
      console.log({ event, args });
    }
    this.events.emit(event, ...args);
  }

  onError = (): void => {
    const errorData = this.readError();
    if (errorData.code > 0) {
      console.error(errorData);
      this.emit('error', errorData);
    }
    this.onRefresh(true);
  };

  onRefresh = (isRedraw: boolean): void => {
    this.updateLayout();

    if (isRedraw || this.module._isMainDescChanged()) {
      const ptr = this.allocStrPtr();
      this.module._getMainDesc(ptr);
      const mainDesc = this.readString(ptr);
      this.freePtr(ptr);
      this.emit('main_changed', mainDesc);
    }

    if (isRedraw || this.module._isVarsDescChanged()) {
      const ptr = this.allocStrPtr();
      this.module._getVarsDesc(ptr);
      const varsDesc = this.readString(ptr);
      this.freePtr(ptr);
      this.emit('stats_changed', varsDesc);
    }

    if (isRedraw || this.module._isActionsChanged()) {
      const countPtr = this.allocPtr();

      const listPtr = this.module._getActions(countPtr);
      const count = this.readInt(countPtr);
      const actions = this.readListItems(listPtr, count);

      this.module._freeItemsList(listPtr);
      this.freePtr(countPtr);

      this.emit('actions_changed', actions);
    }

    if (isRedraw || this.module._isObjectsChanged()) {
      const countPtr = this.allocPtr();

      const listPtr = this.module._getObjects(countPtr);
      const count = this.readInt(countPtr);
      const objects = this.readListItems(listPtr, count);

      this.module._freeItemsList(listPtr);
      this.freePtr(countPtr);

      this.emit('objects_changed', objects);
    }

    this.emit('refresh');
  };

  onShowWindow = (type: QspPanel, isShown: boolean): void => {
    this.emit('panel_visibility', type, isShown);
  };

  onMenu = (listPtr: Ptr, count: number): void => {
    const items = this.readListItems(listPtr, count);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onSelect = (index: number): void => {
        wakeUp(index);
      };
      this.emit('menu', items, onSelect);
    });
  };

  onMsg = (textPtr: StringPtr): void => {
    this.onRefresh(false);
    const text = this.readString(textPtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const closed = (): void => {
        wakeUp(0);
      };
      this.emit('msg', text, closed);
    });
  };

  onInput = (textPtr: StringPtr, retPtr: Ptr, maxSize: number): void => {
    this.onRefresh(false);
    const text = this.readString(textPtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onInput = (inputText: string): void => {
        this.module.stringToUTF32(inputText, retPtr, maxSize);
        wakeUp(0);
      };
      this.emit('input', text, onInput);
    });
  };

  onWait = (ms: number): void => {
    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onWait = (): void => wakeUp(0);
      this.emit('wait', ms, onWait);
    });
  };

  onSetTimer = (ms: number): void => {
    this.emit('timer', ms);
  };

  onSetUserInput = (textPtr: StringPtr): void => {
    const text = this.readString(textPtr);
    this.emit('user_input', text);
  };

  onView = (pathPtr: StringPtr): void => {
    const path = this.readString(pathPtr);
    this.emit('view', path);
  };

  onDebug = (strPtr: StringPtr): void => {
    const text = this.readString(strPtr);
    console.log('DEBUG:', text);
  };

  onSystemCmd = (strPtr: StringPtr): void => {
    const text = this.readString(strPtr);
    this.emit('system_cmd', text);
  };

  onGetMS = (): number => {
    const elapsed = Date.now() - this.time;
    this.time = Date.now();
    return elapsed;
  };

  onOpenGame = (pathPtr: StringPtr, isNewGame: boolean): void => {
    const path = this.readString(pathPtr);
    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onOpened = (): void => {
        wakeUp(0);
      };
      this.emit('open_game', path, isNewGame, onOpened);
    });
  };

  onOpenGameStatus = (pathPtr: StringPtr): void => {
    const path = this.readString(pathPtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onLoaded = (): void => {
        wakeUp(0);
      };
      this.emit('load_save', path, onLoaded);
    });
  };

  onSaveGameStatus = (pathPtr: StringPtr): void => {
    const path = this.readString(pathPtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onSaved = (): void => {
        wakeUp(0);
      };
      this.emit('save_game', path, onSaved);
    });
  };

  onIsPlay = (filePtr: StringPtr): void => {
    const file = this.readString(filePtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      this.emit('is_play', file, (result) => wakeUp(result ? 1 : 0));
    });
  };

  onPlayFile = (filePtr: StringPtr, volume: number): void => {
    const file = this.readString(filePtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onReady = (): void => {
        wakeUp(0);
      };
      this.emit('play_file', file, volume, onReady);
    });
  };

  onCloseFile = (filePtr: StringPtr): void => {
    const file = this.readString(filePtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onReady = (): void => {
        wakeUp(0);
      };
      this.emit('close_file', file, onReady);
    });
  };

  private updateLayout(): void {
    const useHtml = Boolean(this.readVariableNumber('USEHTML'));
    const nosave = Boolean(this.readVariableNumber('NOSAVE'));
    const backgroundColor = this.readVariableNumber('BCOLOR');
    const color = this.readVariableNumber('FCOLOR');
    const linkColor = this.readVariableNumber('LCOLOR');
    const fontSize = this.readVariableNumber('FSIZE');
    const fontName = this.readVariableString('$FNAME');
    const backgroundImage = this.readVariableString('$BACKIMAGE');

    const layout = {
      nosave,
      useHtml,
      backgroundColor,
      backgroundImage,
      color,
      linkColor,
      fontSize,
      fontName,
    };

    if (!this.layout || !shallowEqual(this.layout, layout)) {
      this.layout = layout;
      this.emit('layout', this.layout);
    }
  }

  private readChars(ptr: CharsPtr): string {
    return this.module.UTF32ToString(ptr);
  }

  private readString(ptr: StringPtr): string {
    const start = this.derefPtr(ptr);
    if (!start) {
      return '';
    }
    const end = this.derefPtr(this.movePtr(ptr));
    return this.module.UTF32ToString(start, end - start);
  }

  private prepareString(value: string): CharsPtr {
    const length = this.module.lengthBytesUTF32(value);
    const ptr = this.module._malloc(length + 4);
    this.module.stringToUTF32(value, ptr, length + 4);
    return ptr;
  }

  private readInt(ptr: Ptr): number {
    return this.module.getValue(ptr, 'i32');
  }

  private readError(): QspErrorData {
    const errorNumPtr = this.allocPtr();
    const errorLocPtr = this.allocStrPtr();
    const errorActIndexPtr = this.allocPtr();
    const errorLinePtr = this.allocPtr();

    this.module._getLastErrorData(errorNumPtr, errorLocPtr, errorActIndexPtr, errorLinePtr);

    const code = this.readInt(errorNumPtr);
    this.freePtr(errorNumPtr);

    const ptr = this.allocStrPtr();
    this.module._getErrorDesc(ptr, code);
    const description = this.readString(ptr);
    this.freePtr(ptr);

    const location = this.readString(errorLocPtr);
    this.freePtr(errorLocPtr);

    const actionIndex = this.readInt(errorActIndexPtr);
    this.freePtr(errorActIndexPtr);

    const line = this.readInt(errorLinePtr);
    this.freePtr(errorLinePtr);

    return {
      code,
      location,
      description,
      actionIndex,
      line,
    };
  }

  private readListItems(listPtr: Ptr, count: number): QspListItem[] {
    const list: QspListItem[] = [];
    let ptr = listPtr;
    for (let i = 0; i < count; i++) {
      const image = this.readString(ptr);
      ptr = this.movePtr(ptr, 2);

      const name = this.readString(ptr);
      ptr = this.movePtr(ptr, 2);

      list.push({
        name,
        image,
      });
    }
    return list;
  }

  /* Pointers magic */
  private allocPtr(): Ptr {
    return this.module._malloc(POINTER_SIZE);
  }

  private allocStrPtr(): Ptr {
    return this.module._malloc(POINTER_SIZE * 2);
  }

  private derefPtr(ptr: Ptr): Ptr {
    return this.module.getValue(ptr, 'i32');
  }

  private movePtr(ptr: Ptr, times = 1): Ptr {
    return ptr + POINTER_SIZE * times;
  }

  private freePtr(ptr: Ptr): void {
    this.module._free(ptr);
  }

  toJSON(): string {
    return '[QSP API]';
  }
}
