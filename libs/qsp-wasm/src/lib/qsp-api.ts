import EventEmitter from 'eventemitter3';
import { QspAPI, QspErrorData, QspEvents, QspListItem } from './contracts';
import { QspModule } from '../wasm/qsp';
import { Ptr, CharsPtr, QspCallType, QspPanel } from '../wasm/types';

export class QspAPIImpl implements QspAPI {
  private events = new EventEmitter();
  private time: number;

  constructor(private module: QspModule) {
    this.init();
  }

  on<E extends keyof QspEvents>(event: E, listener: QspEvents[E]): void {
    this.events.on(event, listener);
  }

  off<E extends keyof QspEvents>(event: E, listener: QspEvents[E]): void {
    this.events.off(event, listener);
  }

  openGame(data: ArrayBuffer, fileName: string, isNewGame: boolean): boolean {
    const bytes = new Uint8Array(data);
    const ptr = this.module._malloc(bytes.length);
    this.module.HEAPU8.set(bytes, ptr);

    const namePtr = this.stringToPTr(fileName);

    const result = this.onCalled(
      this.module._QSPLoadGameWorld(ptr, bytes.length, namePtr, isNewGame)
    );
    this.module._free(ptr);
    this.module._free(namePtr);

    return result;
  }

  saveGame(): ArrayBuffer {
    const sizePtr = this.module._malloc(4);
    const ptr = this.module._QSPSaveGame(sizePtr);
    const size = this.module.getValue(sizePtr, 'i32');

    if (!size) {
      this.onCalled(false);
    }

    const data = this.module.HEAPU8.slice(ptr, size);

    this.module._free(sizePtr);
    this.module._free(ptr);

    return data.buffer;
  }

  loadSave(data: ArrayBuffer) {
    const bytes = new Uint8Array(data);
    const ptr = this.module._malloc(bytes.length);
    this.module.HEAPU8.set(bytes, ptr);
    this.onCalled(this.module._QSPOpenSavedGame(ptr, bytes.length));
    this.module._free(ptr);
  }

  restartGame(): boolean {
    this.time = Date.now();
    return this.onCalled(this.module._QSPRestartGame());
  }

  selectAction(index: number): boolean {
    return this.onCalled(this.module._QSPSelectAction(index));
  }

  selectObject(index: number): boolean {
    return this.onCalled(this.module._QSPSelectObject(index));
  }

  version(): string {
    return this.readString(this.module._QSPGetVersion());
  }

  readVariableNumber(name: string, index = 0): number {
    const ptr = this.stringToPTr(name);
    const value = this.module._QSPGetVarNumValue(ptr, index);
    this.module._free(ptr);
    return value;
  }

  readVariableString(name: string, index = 0): string {
    const ptr = this.stringToPTr(name);
    const resultPtr = this.module._QSPGetVarStrValue(ptr, index);
    this.module._free(ptr);
    const value = this.readString(resultPtr);
    this.module._free(resultPtr);
    return value;
  }

  execCode(code: string): boolean {
    const ptr = this.stringToPTr(code);
    const result = this.module._QSPExecString(ptr);
    this.module._free(ptr);
    return this.onCalled(result);
  }

  execCounter(): boolean {
    return this.onCalled(this.module._QSPExecCounter());
  }

  execUserInput(code: string): boolean {
    const ptr = this.stringToPTr(code);
    const result = this.module._QSPExecUserInput(ptr);
    this.module._free(ptr);
    return this.onCalled(result);
  }

  private init() {
    this.module._QSPInit();
    this.module._qspInitCallBacks();
    this.registerCallbacks();
  }

  private registerCallbacks() {
    const onRefreshInt = this.module.addFunction(this.onRefresh, 'ii');
    this.module._qspSetCallBack(QspCallType.REFRESHINT, onRefreshInt);

    const onShowWindow = this.module.addFunction(this.onShowWindow, 'iii');
    this.module._qspSetCallBack(QspCallType.SHOWWINDOW, onShowWindow);

    const onMenu = this.module.addFunction(this.onMenu, 'iii');
    this.module._qspSetCallBack(QspCallType.SHOWMENU, onMenu);

    const onMsg = this.module.addFunction(this.onMsg, 'ii');
    this.module._qspSetCallBack(QspCallType.SHOWMSGSTR, onMsg);

    const onInput = this.module.addFunction(this.onInput, 'iiii');
    this.module._qspSetCallBack(QspCallType.INPUTBOX, onInput);

    const onWait = this.module.addFunction(this.onWait, 'ii');
    this.module._qspSetCallBack(QspCallType.SLEEP, onWait);

    const onSetTimer = this.module.addFunction(this.onSetTimer, 'ii');
    this.module._qspSetCallBack(QspCallType.SETTIMER, onSetTimer);

    const onSetUserInput = this.module.addFunction(this.onSerUserInput, 'ii');
    this.module._qspSetCallBack(QspCallType.SETINPUTSTRTEXT, onSetUserInput);

    const onView = this.module.addFunction(this.onView, 'ii');
    this.module._qspSetCallBack(QspCallType.SHOWIMAGE, onView);

    const onDebug = this.module.addFunction(this.onDebug, 'ii');
    this.module._qspSetCallBack(QspCallType.DEBUG, onDebug);

    const onGetMS = this.module.addFunction(this.onGetMS, 'i');
    this.module._qspSetCallBack(QspCallType.GETMSCOUNT, onGetMS);

    const onOpenGame = this.module.addFunction(this.onOpenGame, 'iii');
    this.module._qspSetCallBack(QspCallType.OPENGAME, onOpenGame);

    const onOpenGameStatus = this.module.addFunction(
      this.onOpenGameStatus,
      'ii'
    );
    this.module._qspSetCallBack(QspCallType.SAVEGAMESTATUS, onOpenGameStatus);

    const onSaveGameStatus = this.module.addFunction(
      this.onSaveGameStatus,
      'ii'
    );
    this.module._qspSetCallBack(QspCallType.SAVEGAMESTATUS, onSaveGameStatus);
  }

  private emit<
    E extends keyof QspEvents,
    CB extends QspEvents[E] = QspEvents[E]
  >(event: E, ...args: Parameters<CB>): void {
    console.log({ event, args });
    this.events.emit(event, ...args);
  }

  onRefresh = (isRedraw: boolean) => {
    this.updateLayout();

    if (isRedraw || this.module._QSPIsMainDescChanged()) {
      const mainDesc = this.readString(this.module._QSPGetMainDesc());
      this.emit('main_changed', mainDesc);
    }

    if (isRedraw || this.module._QSPIsVarsDescChanged()) {
      const varsDesc = this.readString(this.module._QSPGetVarsDesc());
      this.emit('stats_changed', varsDesc);
    }

    if (isRedraw || this.module._QSPIsActionsChanged()) {
      const countPtr = this.module._malloc(4);
      const ptr = this.module._QSPGetActions(countPtr);
      const count = this.module.getValue(countPtr, 'i32');
      const actions = this.readListItems(ptr, count);
      this.module._free(countPtr);
      this.module._free(ptr);
      this.emit('actions_changed', actions);
    }

    if (isRedraw || this.module._QSPIsObjectsChanged()) {
      const countPtr = this.module._malloc(4);
      const ptr = this.module._QSPGetObjects(countPtr);
      const count = this.module.getValue(countPtr, 'i32');
      const objects = this.readListItems(ptr, count);
      this.module._free(countPtr);
      this.module._free(ptr);
      this.emit('objects_changed', objects);
    }
  };

  onShowWindow = (type: QspPanel, isShown: boolean) => {
    this.emit('panel_visibility', type, isShown);
  };

  onMenu = (listPtr: Ptr, count: number) => {
    const items = this.readListItems(listPtr, count);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onSelect = (index: number) => {
        wakeUp(index);
      };
      this.emit('menu', items, onSelect);
    });
  };

  onMsg = (textPtr: CharsPtr) => {
    this.onRefresh(false);
    const text = this.readString(textPtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const closed = () => {
        wakeUp(0);
      };
      this.emit('msg', text, closed);
    });
  };

  onInput = (textPtr: CharsPtr, retPtr: Ptr, maxSize: number) => {
    this.onRefresh(false);
    const text = this.readString(textPtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onInput = (inputText: string) => {
        this.module.stringToUTF32(inputText, retPtr, maxSize);
        wakeUp(0);
      };
      this.emit('input', text, onInput);
    });
  };

  onWait = (ms: number) => {
    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onWait = () => wakeUp(0);
      this.emit('wait', ms, onWait);
    });
  };

  onSetTimer = (ms: number) => {
    this.emit('timer', ms);
  };

  onSerUserInput = (textPtr: CharsPtr) => {
    const text = this.readString(textPtr);
    this.module._free(textPtr);
    this.emit('user_input', text);
  };

  onView = (pathPtr: CharsPtr) => {
    const path = this.readString(pathPtr);
    this.module._free(pathPtr);
    this.emit('view', path);
  };

  onDebug = (strPtr: CharsPtr) => {
    const text = this.readString(strPtr);
    this.module._free(strPtr);
    console.log('DEBUG:', text);
  };

  onGetMS = () => {
    const elapsed = Date.now() - this.time;
    this.time = Date.now();
    return elapsed;
  };

  onOpenGame = (pathPtr: CharsPtr, isNewGame: boolean) => {
    const path = this.readString(pathPtr);
    this.module._free(pathPtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onOpened = () => {
        wakeUp(0);
      };
      this.emit('open_game', path, isNewGame, onOpened);
    });
  };

  onOpenGameStatus = (pathPtr: CharsPtr) => {
    const path = this.readString(pathPtr);
    this.module._free(pathPtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onLoaded = () => {
        wakeUp(0);
      };
      this.emit('load_save', path, onLoaded);
    });
  };

  onSaveGameStatus = (pathPtr: CharsPtr) => {
    const path = this.readString(pathPtr);
    this.module._free(pathPtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onSaved = () => {
        wakeUp(0);
      };
      this.emit('save_game', path, onSaved);
    });
  };

  private updateLayout() {
    const useHtml = Boolean(this.readVariableNumber('USEHTML'));
    const backgroundColor = this.convertColor(
      this.readVariableNumber('BCOLOR')
    );
    const color = this.convertColor(this.readVariableNumber('FCOLOR'));
    const linkColor = this.convertColor(this.readVariableNumber('LCOLOR'));
    const fontSize = this.readVariableNumber('FSIZE');
    const fontName = this.readVariableString('$FNAME');
    const backgroundImage = this.readVariableString('$BACKIMAGE');
    this.emit('layout', {
      useHtml,
      backgroundColor,
      backgroundImage,
      color,
      linkColor,
      fontSize,
      fontName,
    });
  }

  private onCalled(isSuccessfull: boolean): boolean {
    if (!isSuccessfull) {
      const errorData = this.readError();
      if (errorData.code > 0) {
        console.log(errorData);
        this.emit('error', errorData);
      }
    }
    return isSuccessfull;
  }

  private readString(ptr: CharsPtr): string {
    return this.module.UTF32ToString(ptr);
  }

  private stringToPTr(value: string): CharsPtr {
    const length = this.module.lengthBytesUTF32(value);
    const ptr = this.module._malloc(length);
    this.module.stringToUTF32(value, ptr);
    return ptr;
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

  private readListItems(listPtr: Ptr, count: number): QspListItem[] {
    const list: QspListItem[] = [];
    let ptr = listPtr;
    for (let i = 0; i < count; i++) {
      const namePtr = this.getCharsPtr(ptr);
      const name = this.readString(namePtr);
      ptr = this.movePtr(ptr);

      const imagePtr = this.getCharsPtr(ptr);
      const image = this.readString(imagePtr);
      ptr = this.movePtr(ptr);

      list.push({
        name,
        image,
      });
    }
    return list;
  }

  private getCharsPtr(ptr: Ptr): CharsPtr {
    return this.module.getValue(ptr, 'i32');
  }

  private movePtr(ptr: Ptr): Ptr {
    return ptr + 4; // pointers are 4 bytes in C
  }

  private convertColor(value: number): string {
    if (!value) return '';
    const arr = new Uint8Array(4);
    const view = new DataView(arr.buffer);
    view.setInt32(0, value);
    const [a, b, g, r] = arr;
    return `rgba(${r},${g},${b},${a})`;
  }

  toJSON() {
    return '[QSP API]';
  }
}
