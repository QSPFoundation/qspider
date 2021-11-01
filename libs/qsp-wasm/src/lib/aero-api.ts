/*
Справка по AeroQSP (дополнение к основной справке QSP)

not supported
SCROLL_SPEED
NEWLOC_EFFECT_SEQ

Для всех элементов оформления рекомендуется использовать формат картинок PNG, с поддержкой альфа-канала (регулируемая прозрачность). Кроме этого, HTML-движок и оператор VIEW поддерживают анимированные GIF-файлы.

Список эффектов (для $NEWLOC_EFFECT, $VIEW_EFFECT, $INPUT_EFFECT, $MSG_EFFECT, $MENU_EFFECT)
fade
quake
blur
h_blinds
v_blinds
l_slide
r_slide
u_slide
d_slide
iris
photo
pixels
rotate
v_squeeze
h_squeeze
zoom
wipe1
wipe2
wipe3
wipe4
Поддержка HTML
Текущая версия HTML-движка ориентирована на использование стилей, а не простых аттрибутов элементов.

Поддерживаемые теги:

DIV
TABLE
TR
TD
TH
CENTER
A
IMG
BR
P
B
I
U
FONT
SPAN
LI
OL
UL
Поддерживаемые свойства:

width (проценты, пиксели)
height (только пиксели)
position ("absolute")
left (пиксели)
top (пиксели)
border
border-width
border-style
border-color
display ("inline")
float ("left")
text-align ("left", "right", "center")
vertical-align ("top", "middle", "bottom")
font-family
font-size
font-style
font-weight
leading
letter-spacing
margin-left
margin-right
text-decoration
text-indent
color
padding
padding-left
padding-top
padding-right
padding-bottom
background-color
background-image

Встраиваемые шрифты
AeroQSP поддерживает встраивание шрифтов в игру. Для этого необходимо swf-файл со встроенным шрифтом положить в zip-архив игры (в любую папку). Использование встроенного шрифта аналогично использованию обычного системного шрифта - там, где необходимо, указывается его имя. При наличии в архиве игры хотя бы одного встроенного шрифта, использование системных шрифтов запрещено.

Звуки и музыка
Поддерживается воспроизведение MP3-файлов.

Файл конфигурации
Конфигурация игры дополнительно настраивается в файле "config.xml", который необходимо разместить в архиве рядом с qsp-файлом. Пример файла "config.xml":

<game width="504" height="680" title="Чашка кофе"/>
Здесь:

width	указывает ширину экрана игры в пикселях
height	указывает высоту экрана игры в пикселях
title	название игры (отображается в заголовке окна)
Кодировка файла - UTF-8.

PS: По умолчанию размер экрана игры 800x600 пикселей.
*/

import EventEmitter from 'eventemitter3';
import { QspAPI } from './contracts';
import { equal } from './helpers';

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

export type AeroEvents = {
  scroll_ui: (ui: ScrollUI) => void;
  player_ui: (ui: PlayerUI) => void;
  main_ui: (ui: AeroPanelUI) => void;
  stats_ui: (ui: AeroPanelUI) => void;
  actions_ui: (ui: ListPanelUI) => void;
  objects_ui: (ui: ListPanelUI) => void;
  user_input_ui: (ui: AeroPanelUI) => void;
  view_ui: (ui: ViewUI) => void;
  input_ui: (ui: InputUI) => void;
  msg_ui: (ui: MsgUI) => void;
  menu_ui: (ui: MenuUI) => void;
};

export const TEXT_PLACEHOLDER = '%TEXT%';
export const IMAGE_PLACEHOLDER = '%IMAGE%';

export const LIST_UI = '<table><tr><td><img src="%IMAGE%"/></td><td style="width:100%;">%TEXT%</td></tr></table>';
export const SELECTED_LIST_UI =
  '<table><tr><td><img src="%IMAGE%"/></td><td style="width:100%;color:#0000FF;">%TEXT%</td></tr></table>';

export class AeroApi {
  private scrollUI?: ScrollUI;
  private playerUI?: PlayerUI;
  private mainPanelUI?: AeroPanelUI;
  private statPanelUI?: AeroPanelUI;
  private actionsPanelUI?: ListPanelUI;
  private objectsPanelUI?: ListPanelUI;
  private userInputUI?: AeroPanelUI;
  private viewUI?: ViewUI;
  private inputUI?: InputUI;
  private msgUI?: MsgUI;
  private menuUI?: MenuUI;

  private events = new EventEmitter<keyof AeroEvents>();

  constructor(private qspApi: QspAPI) {
    this.qspApi.on('refresh', this.onRefresh);
  }

  on<E extends keyof AeroEvents>(event: E, listener: AeroEvents[E]): void {
    this.events.on(event, listener);
  }

  off<E extends keyof AeroEvents>(event: E, listener: AeroEvents[E]): void {
    this.events.off(event, listener);
  }

  onRefresh = (): void => {
    this.updateScrollUI();
    this.updatePlayerUI();
    this.updateMainpanelUI();
    this.updateStatsUI();
    this.updateActionsUI();
    this.updateObjectsUI();
    this.updateUserInputUI();
    this.updateViewUI();
    this.updateInputUI();
    this.updateMsgUI();
    this.updateMenuUI();
  };

  private updateScrollUI(): void {
    const scrollUI: ScrollUI = {
      upArrowImage: this.qspApi.readVariableString('$UP_ARROW_IMAGE'),
      downArrowImage: this.qspApi.readVariableString('$DOWN_ARROW_IMAGE'),
      hideArrows: Boolean(this.qspApi.readVariableNumber('HIDE_SCROLL_ARROWS')),
    };
    if (!this.scrollUI || !equal(this.scrollUI, scrollUI)) {
      this.scrollUI = scrollUI;
      this.events.emit('scroll_ui', scrollUI);
    }
  }

  private updatePlayerUI(): void {
    const playerUI: PlayerUI = {
      styles: this.qspApi.readVariableString('$STYLESHEET'),
      disableShade: Boolean(this.qspApi.readVariableNumber('DISABLESHADE')),
      disableScroll: Boolean(this.qspApi.readVariableNumber('DISABLESCROLL')),
      disableAutoref: Boolean(this.qspApi.readVariableNumber('DISABLEAUTOREF')),
      newLocEffect: {
        name: this.qspApi.readVariableString('$NEWLOC_EFFECT') as AeroEffectType,
        time: this.qspApi.readVariableNumber('NEWLOC_EFFECT_TIME') || 500,
      },
      sequenceNewLocEffect: Boolean(this.qspApi.readVariableNumber('NEWLOC_EFFECT_SEQ')),
      backImage: this.qspApi.readVariableString('$BACKIMAGE'),
      topImage: this.qspApi.readVariableString('$TOPIMAGE'),
      intergratedActions: Boolean(this.qspApi.readVariableNumber('INTEGRATED_ACTIONS')),
    };
    if (!this.playerUI || !equal(this.playerUI, playerUI)) {
      this.playerUI = playerUI;
      this.events.emit('player_ui', playerUI);
    }
  }

  private updateMainpanelUI(): void {
    const mainPanelUI: AeroPanelUI = {
      x: this.qspApi.readVariableNumber('MAINDESC_X') || 4,
      y: this.qspApi.readVariableNumber('MAINDESC_Y') || 4,
      width: this.qspApi.readVariableNumber('MAINDESC_W') || 589,
      height: this.qspApi.readVariableNumber('MAINDESC_H') || 389,
      format: this.qspApi.readVariableString('$MAIN_FORMAT') || TEXT_PLACEHOLDER,
      backImage: this.qspApi.readVariableString('$MAINDESC_BACKIMAGE'),
    };
    if (!this.mainPanelUI || !equal(this.mainPanelUI, mainPanelUI)) {
      this.mainPanelUI = mainPanelUI;
      this.events.emit('main_ui', mainPanelUI);
    }
  }

  private updateStatsUI(): void {
    const statPanelUI: AeroPanelUI = {
      x: this.qspApi.readVariableNumber('STATDESC_X') || 596,
      y: this.qspApi.readVariableNumber('STATDESC_Y') || 396,
      width: this.qspApi.readVariableNumber('STATDESC_W') || 200,
      height: this.qspApi.readVariableNumber('STATDESC_H') || 200,
      format: this.qspApi.readVariableString('$STAT_FORMAT') || TEXT_PLACEHOLDER,
      backImage: this.qspApi.readVariableString('$STATDESC_BACKIMAGE'),
    };
    if (!this.statPanelUI || !equal(this.statPanelUI, statPanelUI)) {
      this.statPanelUI = statPanelUI;
      this.events.emit('stats_ui', statPanelUI);
    }
  }

  private updateActionsUI(): void {
    const actionsPanelUI: ListPanelUI = {
      x: this.qspApi.readVariableNumber('ACTIONS_X') || 4,
      y: this.qspApi.readVariableNumber('ACTIONS_Y') || 396,
      width: this.qspApi.readVariableNumber('ACTIONS_W') || 589,
      height: this.qspApi.readVariableNumber('ACTIONS_H') || 169,
      format: this.qspApi.readVariableString('$ACTION_FORMAT') || LIST_UI,
      selectedFormat: this.qspApi.readVariableString('$SEL_ACTION_FORMAT') || SELECTED_LIST_UI,
      backImage: this.qspApi.readVariableString('$ACTIONS_BACKIMAGE'),
    };
    if (!this.actionsPanelUI || !equal(this.actionsPanelUI, actionsPanelUI)) {
      this.actionsPanelUI = actionsPanelUI;
      this.events.emit('actions_ui', actionsPanelUI);
    }
  }

  private updateObjectsUI(): void {
    const objectsPanelUI: ListPanelUI = {
      x: this.qspApi.readVariableNumber('OBJECTS_X') || 596,
      y: this.qspApi.readVariableNumber('OBJECTS_Y') || 4,
      width: this.qspApi.readVariableNumber('OBJECTS_W') || 200,
      height: this.qspApi.readVariableNumber('OBJECTS_H') || 389,
      format: this.qspApi.readVariableString('$OBJECT_FORMAT') || LIST_UI,
      selectedFormat: this.qspApi.readVariableString('$SEL_OBJECT_FORMAT') || SELECTED_LIST_UI,
      backImage: this.qspApi.readVariableString('$OBJECTS_BACKIMAGE'),
    };
    if (!this.objectsPanelUI || !equal(this.objectsPanelUI, objectsPanelUI)) {
      this.objectsPanelUI = objectsPanelUI;
      this.events.emit('objects_ui', objectsPanelUI);
    }
  }

  private updateUserInputUI(): void {
    const userInputUI: AeroPanelUI = {
      x: this.qspApi.readVariableNumber('USERINPUT_X') || 4,
      y: this.qspApi.readVariableNumber('USERINPUT_Y') || 568,
      width: this.qspApi.readVariableNumber('USERINPUT_W') || 589,
      height: this.qspApi.readVariableNumber('USERINPUT_H') || 28,
      format: '',
      backImage: '',
    };
    if (!this.userInputUI || !equal(this.userInputUI, userInputUI)) {
      this.userInputUI = userInputUI;
      this.events.emit('user_input_ui', userInputUI);
    }
  }

  private updateViewUI(): void {
    const viewUI: ViewUI = {
      x: this.qspApi.readVariableNumber('VIEW_X') || 250,
      y: this.qspApi.readVariableNumber('VIEW_Y') || 150,
      width: this.qspApi.readVariableNumber('VIEW_W') || 300,
      height: this.qspApi.readVariableNumber('VIEW_H') || 300,
      effect: {
        name: this.qspApi.readVariableString('$VIEW_EFFECT') as AeroEffectType,
        time: this.qspApi.readVariableNumber('VIEW_EFFECT_TIME'),
      },
      alwaysShow: Boolean(this.qspApi.readVariableNumber('ALWAYS_SHOW_VIEW')),
    };
    if (!this.viewUI || !equal(this.viewUI, viewUI)) {
      this.viewUI = viewUI;
      this.events.emit('view_ui', viewUI);
    }
  }

  private updateInputUI(): void {
    const inputUI: InputUI = {
      backImage: this.qspApi.readVariableString('$INPUT_BACKIMAGE'),
      x: this.qspApi.readVariableNumber('INPUT_X') || 200,
      y: this.qspApi.readVariableNumber('INPUT_Y') || 165,
      format: this.qspApi.readVariableString('$INPUT_FORMAT') || TEXT_PLACEHOLDER,
      text: {
        x: this.qspApi.readVariableNumber('INPUT_TEXT_X') || 4,
        y: this.qspApi.readVariableNumber('INPUT_TEXT_Y') || 4,
        width: this.qspApi.readVariableNumber('INPUT_TEXT_W') || 392,
        height: this.qspApi.readVariableNumber('INPUT_TEXT_H') || 231,
      },
      field: {
        x: this.qspApi.readVariableNumber('INPUT_BAR_X') || 4,
        y: this.qspApi.readVariableNumber('INPUT_BAR_Y') || 238,
        width: this.qspApi.readVariableNumber('INPUT_BAR_W') || 312,
        height: this.qspApi.readVariableNumber('INPUT_BAR_H') || 28,
      },
      okButton: {
        x: this.qspApi.readVariableNumber('INPUT_OK_X') || 324,
        y: this.qspApi.readVariableNumber('INPUT_OK_Y') || 239,
        image: this.qspApi.readVariableString('$INPUT_OK_IMAGE'),
      },
      cancelButton: {
        x: this.qspApi.readVariableNumber('INPUT_CANCEL_X') || 362,
        y: this.qspApi.readVariableNumber('INPUT_CANCEL_Y') || 239,
        image: this.qspApi.readVariableString('$INPUT_CANCEL_IMAGE'),
      },
      effect: {
        name: this.qspApi.readVariableString('$INPUT_EFFECT') as AeroEffectType,
        time: this.qspApi.readVariableNumber('INPUT_EFFECT_TIME') || 500,
      },
    };

    if (!this.inputUI || !equal(this.inputUI, inputUI)) {
      this.inputUI = inputUI;
      this.events.emit('input_ui', inputUI);
    }
  }

  private updateMsgUI(): void {
    const msgUI: MsgUI = {
      backImage: this.qspApi.readVariableString('$MSG_BACKIMAGE'),
      x: this.qspApi.readVariableNumber('MSG_X') || 200,
      y: this.qspApi.readVariableNumber('MSG_Y') || 165,
      format: this.qspApi.readVariableString('$MSG_FORMAT') || TEXT_PLACEHOLDER,
      text: {
        x: this.qspApi.readVariableNumber('MSG_TEXT_X') || 4,
        y: this.qspApi.readVariableNumber('MSG_TEXT_Y') || 4,
        width: this.qspApi.readVariableNumber('MSG_TEXT_W') || 392,
        height: this.qspApi.readVariableNumber('MSG_TEXT_H') || 231,
      },
      okButton: {
        x: this.qspApi.readVariableNumber('MSG_OK_X') || 186,
        y: this.qspApi.readVariableNumber('MSG_OK_Y') || 239,
        image: this.qspApi.readVariableString('$MSG_OK_IMAGE'),
      },
      effect: {
        name: this.qspApi.readVariableString('$MSG_EFFECT') as AeroEffectType,
        time: this.qspApi.readVariableNumber('MSG_EFFECT_TIME') || 500,
      },
    };

    if (!this.msgUI || !equal(this.msgUI, msgUI)) {
      this.msgUI = msgUI;
      this.events.emit('msg_ui', msgUI);
    }
  }

  private updateMenuUI(): void {
    const menuUI: MenuUI = {
      fixedSize: Boolean(this.qspApi.readVariableNumber('FIXED_SIZE_MENU')),
      padding: this.qspApi.readVariableNumber('MENU_PADDING') || 4,
      borderWidth: this.qspApi.readVariableNumber('MENU_BORDER') || 1,
      borderColor: this.convertColor(this.qspApi.readVariableNumber('MENU_BORDER_COLOR')) || 'rgba(64,64,64,150)',
      backImage: this.qspApi.readVariableString('$MENU_BACKIMAGE'),
      x: this.qspApi.readVariableNumber('MENU_X') || -1,
      y: this.qspApi.readVariableNumber('MENU_Y') || -1,
      format: this.qspApi.readVariableString('$MENU_FORMAT') || LIST_UI,
      selectedFormat: this.qspApi.readVariableString('$SEL_MENU_FORMAT') || SELECTED_LIST_UI,
      list: {
        x: this.qspApi.readVariableNumber('MENU_LIST_X') || 4,
        y: this.qspApi.readVariableNumber('MENU_LIST_Y') || 4,
        width: this.qspApi.readVariableNumber('MENU_LIST_W') || 153,
        height: this.qspApi.readVariableNumber('MENU_LIST_H') || 123,
      },
      effect: {
        name: this.qspApi.readVariableString('$MENU_EFFECT') as AeroEffectType,
        time: this.qspApi.readVariableNumber('MENU_EFFECT_TIME') || 500,
      },
    };

    if (!this.menuUI || !equal(this.menuUI, menuUI)) {
      this.menuUI = menuUI;
      this.events.emit('menu_ui', menuUI);
    }
  }

  private convertColor(value: number, withAlpha = true): string | null {
    if (!value) return null;
    const arr = new Uint8Array(4);
    const view = new DataView(arr.buffer);
    view.setInt32(0, value);

    if (withAlpha) {
      const [alpha, blue, green, red] = arr;
      return `rgba(${red},${green},${blue},${alpha})`;
    }

    const [, blue, green, red] = arr;
    return `rgb(${red},${green},${blue})`;
  }
}
