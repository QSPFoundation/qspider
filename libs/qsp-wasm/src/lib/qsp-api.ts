import EventEmitter from 'eventemitter3';
import { QspAPI, QspErrorData, QspEvents, QspListItem } from './contracts';
import { QspModule } from '../wasm/qsp';
import { Ptr, CharsPtr, QspCallType } from '../wasm/types';

export class QspAPIImpl implements QspAPI {
  private events = new EventEmitter();

  constructor(private module: QspModule) {
    this.init();
  }

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

  restartGame(): boolean {
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

  private init() {
    this.module._QSPInit();
    this.module._qspInitCallBacks();
    this.registerCallbacks();
  }

  private registerCallbacks() {
    const onRefreshInt = this.module.addFunction(this.onRefresh, 'ii');
    this.module._qspSetCallBack(QspCallType.REFRESHINT, onRefreshInt);
  }

  private emit<
    E extends keyof QspEvents,
    CB extends QspEvents[E] = QspEvents[E]
  >(event: E, ...args: Parameters<CB>): void {
    console.log({ event, args });
    this.events.emit(event, ...args);
  }

  onRefresh = (isRedraw: boolean) => {
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
      const actions = this.readListItems(countPtr, ptr);
      this.module._free(countPtr);
      this.module._free(ptr);
      this.emit('actions_changed', actions);
    }

    if (isRedraw || this.module._QSPIsObjectsChanged()) {
      const countPtr = this.module._malloc(4);
      const ptr = this.module._QSPGetObjects(countPtr);
      const actions = this.readListItems(countPtr, ptr);
      this.module._free(countPtr);
      this.module._free(ptr);
      this.emit('objects_changed', actions);
    }
  };

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

  private readListItems(countPtr: Ptr, listPtr: Ptr): QspListItem[] {
    const list: QspListItem[] = [];
    const count = this.module.getValue(countPtr, 'i32');
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

  toJSON() {
    return '[QSP API]';
  }
}
