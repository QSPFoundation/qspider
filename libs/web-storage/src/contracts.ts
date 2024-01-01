import { SaveData } from '@qspider/contracts';

export interface WebSaveData extends SaveData {
  data: ArrayBuffer;
}
