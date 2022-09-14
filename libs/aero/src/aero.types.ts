export interface ScrollUI {
  upArrowImage: string;
  downArrowImage: string;
  hideArrows: boolean;
}

export type AeroEffectType =
  | 'fade'
  | 'quake'
  | 'blur'
  | 'h_blinds'
  | 'v_blinds'
  | 'l_slide'
  | 'r_slide'
  | 'u_slide'
  | 'd_slide'
  | 'iris'
  | 'photo'
  | 'pixels'
  | 'rotate'
  | 'v_squeeze'
  | 'h_squeeze'
  | 'zoom'
  | 'wipe1'
  | 'wipe2'
  | 'wipe3'
  | 'wipe4'
  | '';

interface Effect {
  name: AeroEffectType;
  time: number;
}

export interface PlayerUI {
  styles: string;
  disableShade: boolean;
  disableScroll: boolean;
  disableAutoref: boolean;
  newLocEffect: Effect;
  sequenceNewLocEffect: boolean;
  backImage: string;
  topImage: string;
  intergratedActions: boolean;
}

export interface AeroContentRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AeroPanelUI extends AeroContentRectangle {
  format: string;
  backImage: string;
}

export interface ListPanelUI extends AeroPanelUI {
  selectedFormat: string;
}

export interface ViewUI extends AeroContentRectangle {
  effect: Effect;
  alwaysShow: boolean;
}

interface ButtonUi {
  x: number;
  y: number;
  image: string;
}

export interface InputUI {
  backImage: string;
  x: number;
  y: number;
  format: string;
  text: AeroContentRectangle;
  field: AeroContentRectangle;
  okButton: ButtonUi;
  cancelButton: ButtonUi;
  effect: Effect;
}

export interface MsgUI {
  backImage: string;
  x: number;
  y: number;
  format: string;
  text: AeroContentRectangle;
  okButton: ButtonUi;
  effect: Effect;
}

export interface MenuUI {
  fixedSize: boolean;
  padding: number;
  borderWidth: number;
  borderColor: string;
  backImage: string;
  x: number;
  y: number;
  format: string;
  selectedFormat: string;
  list: AeroContentRectangle;
  effect: Effect;
}
