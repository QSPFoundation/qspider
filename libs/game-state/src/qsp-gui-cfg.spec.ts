import { describe, expect, it } from 'vitest';
import { QspGUIPanel } from '@qspider/contracts';
import { buildGuiLayoutTemplate } from './gui-layout';
import {
  buildLayoutTree,
  convertDock,
  convertLayer,
  convertPane,
  extractFromDefaultTheme,
  parseCfg,
  PanelData,
} from './qsp-gui-cfg';

// test-assets/classic/qspgui.cfg
const CLASSIC_CFG = [
  '[Colors]',
  'BackColor=14737632',
  'FontColor=0',
  'LinkColor=16711680',
  '[Font]',
  'FontSize=12',
  'FontName=Segoe UI',
  'UseFontSize=0',
  '[General]',
  'Volume=0',
  'ShowHotkeys=0',
  'Panels=layout2|name=imgview;caption=Preview;state=1080035327;dir=1;layer=0;row=0;pos=0;prop=100000;bestw=832;besth=150;minw=50;minh=50;maxw=-1;maxh=-1;floatx=175;floaty=148;floatw=518;floath=372|name=desc;caption=;state=768;dir=5;layer=0;row=0;pos=0;prop=100000;bestw=1563;besth=720;minw=-1;minh=-1;maxw=-1;maxh=-1;floatx=-1;floaty=-1;floatw=-1;floath=-1|name=objs;caption=Objects;state=6293500;dir=3;layer=0;row=0;pos=1;prop=39931;bestw=351;besth=252;minw=50;minh=50;maxw=-1;maxh=-1;floatx=1705;floaty=901;floatw=400;floath=250|name=acts;caption=Actions;state=6293500;dir=3;layer=0;row=0;pos=0;prop=177418;bestw=1561;besth=252;minw=50;minh=50;maxw=-1;maxh=-1;floatx=-1;floaty=-1;floatw=-1;floath=-1|name=vars;caption=Additional desc;state=6293500;dir=2;layer=0;row=0;pos=0;prop=82651;bestw=349;besth=703;minw=50;minh=50;maxw=-1;maxh=-1;floatx=1768;floaty=304;floatw=400;floath=250|name=input;caption=Input area;state=2099198;dir=3;layer=1;row=0;pos=0;prop=100000;bestw=848;besth=22;minw=50;minh=20;maxw=-1;maxh=-1;floatx=-1;floaty=-1;floatw=-1;floath=-1|dock_size(5,0,0)=22|dock_size(3,0,0)=271|dock_size(2,0,0)=351|',
  'Language=ru_RU',
  '[Pos]',
  'Left=10',
].join('\r\n');

// apps/player-e2e/fixtures/gui-cfg-game/qspgui.cfg: imgview (state=1080035327) is floating
const FLOATING_PANELS =
  'Panels=layout2|name=imgview;caption=;state=1080035327;dir=1;layer=0;row=0;pos=0;prop=100000;bestw=832;besth=150|name=desc;caption=;state=768;dir=5;layer=0;row=0;pos=0;prop=100000;bestw=1563;besth=720|name=objs;caption=;state=6293500;dir=3;layer=0;row=0;pos=1;prop=39931;bestw=351;besth=252|dock_size(5,0,0)=22|dock_size(4,0,0)=300|';

// shape of public/themes/classic.html
const THEME =
  '<qsp-player><qsp-main class="a">\n<qsp-scrollable><qsp-main-content class="panel-content"></qsp-main-content></qsp-scrollable>\n</qsp-main>' +
  '<qsp-objects><div>objs</div></qsp-objects><qsp-actions><div>acts</div></qsp-actions>' +
  '<qsp-stats><div>vars</div></qsp-stats><qsp-cmd><div>cmd</div></qsp-cmd>' +
  '<qsp-view modal><div>view</div></qsp-view></qsp-player>';

const MAIN =
  '<qsp-main>\n<qsp-scrollable><qsp-main-content class="panel-content"></qsp-main-content></qsp-scrollable>\n</qsp-main>';

const panel = (over: Partial<PanelData>): PanelData => ({
  dir: 'right',
  floating: false,
  layer: 0,
  name: QspGUIPanel.Objects,
  pos: 0,
  row: 0,
  prop: 100000,
  bestw: 300,
  besth: 100,
  ...over,
});

describe('parseCfg', () => {
  it('reads colors, font and panels from the classic default cfg', () => {
    const cfg = parseCfg(CLASSIC_CFG);
    expect(cfg.BackColor).toBe(14737632);
    expect(cfg.FontColor).toBe(0);
    expect(cfg.LinkColor).toBe(16711680);
    expect(cfg.FontSize).toBe(12);
    expect(cfg.FontName).toBe('Segoe UI');
    expect(cfg.Panels.map((p) => p.name)).toEqual(['imgview', 'desc', 'objs', 'acts', 'vars', 'input']);
  });

  it('skips the layout2 marker and reads dock sizes', () => {
    expect(parseCfg(CLASSIC_CFG).Docks).toEqual({ '5,0,0': 22, '3,0,0': 271, '2,0,0': 351 });
  });

  it('maps dir numbers to places and reads numeric fields', () => {
    const [imgview, desc, objs] = parseCfg(CLASSIC_CFG).Panels;
    expect(imgview.dir).toBe('top');
    expect(desc.dir).toBe('center');
    expect(objs).toMatchObject({ dir: 'bottom', layer: 0, pos: 1, row: 0, prop: 39931, bestw: 351, besth: 252 });
  });

  it('marks a panel floating when bit 0 of state is set', () => {
    const [imgview, desc, , , , input] = parseCfg(CLASSIC_CFG).Panels;
    expect(imgview.floating).toBe(true);
    expect(desc.floating).toBe(false);
    expect(input.floating).toBe(false);
  });

  it('keeps floating imgview from a cfg with a floating image panel', () => {
    const cfg = parseCfg(`[General]\n${FLOATING_PANELS}`);
    expect(cfg.Panels.filter((p) => p.floating).map((p) => p.name)).toEqual(['imgview']);
    expect(cfg.Docks).toEqual({ '5,0,0': 22, '4,0,0': 300 });
  });

  it('returns an empty object for text with no known keys', () => {
    expect(parseCfg('[Pos]\nLeft=10')).toEqual({});
  });
});

describe('buildLayoutTree', () => {
  it('nests layers so layer 1 holds layer 0 as its center', () => {
    const { layer, floating } = buildLayoutTree(parseCfg(CLASSIC_CFG).Panels);
    expect(floating.map((p) => p.name)).toEqual(['imgview']);
    expect(layer?.index).toBe(1);
    expect(layer?.bottom.map((p) => p.name)).toEqual(['input']);
    const inner = layer?.center as { index: number; bottom: PanelData[]; right: PanelData[]; center: PanelData[] };
    expect(inner.index).toBe(0);
    expect(inner.bottom.map((p) => p.name)).toEqual(['acts', 'objs']);
    expect(inner.right.map((p) => p.name)).toEqual(['vars']);
    expect(inner.center.map((p) => p.name)).toEqual(['desc']);
  });

  it('drops empty outer layers', () => {
    const { layer } = buildLayoutTree([
      panel({ name: QspGUIPanel.Main, dir: 'center', layer: 0 }),
      panel({ name: QspGUIPanel.Input, dir: 'bottom', layer: 2 }),
    ]);
    expect(layer?.index).toBe(2);
    expect((layer?.center as { index: number }).index).toBe(0);
  });

  it('keeps a floating panel other than imgview out of the layout', () => {
    const { layer, floating } = buildLayoutTree([panel({ name: QspGUIPanel.Objects, floating: true })]);
    expect(layer).toMatchObject({ top: [], right: [], bottom: [], left: [], center: [] });
    expect(floating).toEqual([]);
  });
});

describe('convertPane', () => {
  it('wraps the theme tag of a docked pane and strips its attributes', () => {
    expect(convertPane(panel({ name: QspGUIPanel.Objects, prop: 39931 }), THEME, false)).toBe(
      '<qsp-cl-pane visibility="objs" proportion="39931"><qsp-objects><div>objs</div></qsp-objects></qsp-cl-pane>',
    );
  });

  it('leaves visibility empty for desc', () => {
    expect(convertPane(panel({ name: QspGUIPanel.Main, dir: 'center' }), THEME, false)).toBe(
      `<qsp-cl-pane visibility="" proportion="100000">${MAIN}</qsp-cl-pane>`,
    );
  });

  it('marks a floating pane modal', () => {
    expect(convertPane(panel({ name: QspGUIPanel.ImageView, floating: true }), THEME, true)).toBe(
      '<qsp-cl-pane visibility="imgview" proportion="100000"><qsp-view modal><div>view</div></qsp-view></qsp-cl-pane>',
    );
  });
});

describe('convertDock', () => {
  it('renders nothing for an empty dock', () => {
    expect(convertDock('top', [], {}, THEME)).toBe('');
  });

  it('uses the stored dock size, minus the caption for top and bottom', () => {
    const p = panel({ dir: 'bottom', name: QspGUIPanel.Actions, layer: 0, row: 0 });
    expect(convertDock('bottom', [p], { '3,0,0': 271 }, THEME)).toBe(
      '<qsp-cl-dock place="bottom" visibility="acts" size="251"><qsp-cl-pane visibility="acts" proportion="100000"><qsp-actions><div>acts</div></qsp-actions></qsp-cl-pane></qsp-cl-dock>',
    );
  });

  it('uses the stored dock size as is for left and right', () => {
    const p = panel({ dir: 'right', name: QspGUIPanel.Stats });
    expect(convertDock('right', [p], { '2,0,0': 351 }, THEME)).toBe(
      '<qsp-cl-dock place="right" visibility="vars" size="351"><qsp-cl-pane visibility="vars" proportion="100000"><qsp-stats><div>vars</div></qsp-stats></qsp-cl-pane></qsp-cl-dock>',
    );
  });

  it('falls back to the biggest bestw for a side dock and besth for a top dock', () => {
    const side = [panel({ dir: 'left', bestw: 200 }), panel({ dir: 'left', bestw: 350 })];
    const objs =
      '<qsp-cl-pane visibility="objs" proportion="100000"><qsp-objects><div>objs</div></qsp-objects></qsp-cl-pane>';
    expect(convertDock('left', side, {}, THEME)).toBe(
      `<qsp-cl-dock place="left" visibility="objs|objs" size="350">${objs}${objs}</qsp-cl-dock>`,
    );
    const top = [panel({ dir: 'top', name: QspGUIPanel.ImageView, besth: 150 })];
    expect(convertDock('top', top, {}, THEME)).toBe(
      '<qsp-cl-dock place="top" visibility="imgview" size="150"><qsp-cl-pane visibility="imgview" proportion="100000"><qsp-view><div>view</div></qsp-view></qsp-cl-pane></qsp-cl-dock>',
    );
  });

  it('gives a center dock no size and lists no visibility for desc alone', () => {
    const p = panel({ dir: 'center', name: QspGUIPanel.Main });
    expect(convertDock('center', [p], {}, THEME)).toBe(
      `<qsp-cl-dock place="center"><qsp-cl-pane visibility="" proportion="100000">${MAIN}</qsp-cl-pane></qsp-cl-dock>`,
    );
  });
});

describe('convertLayer', () => {
  it('orders docks top, left, center, right, bottom', () => {
    const { layer } = buildLayoutTree([
      panel({ dir: 'bottom', name: QspGUIPanel.Actions }),
      panel({ dir: 'top', name: QspGUIPanel.ImageView }),
      panel({ dir: 'right', name: QspGUIPanel.Stats }),
      panel({ dir: 'left', name: QspGUIPanel.Objects }),
      panel({ dir: 'center', name: QspGUIPanel.Main }),
    ]);
    const html = convertLayer(layer!, {}, THEME);
    const order = ['place="top"', 'place="left"', 'place="center"', 'place="right"', 'place="bottom"'].map((s) =>
      html.indexOf(s),
    );
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(order.every((i) => i > 0)).toBe(true);
    expect(html.startsWith('<qsp-cl-layer>')).toBe(true);
    expect(html.endsWith('</qsp-cl-dock></qsp-cl-layer>')).toBe(true);
  });
});

describe('extractFromDefaultTheme', () => {
  it('returns an empty string for an unknown pane', () => {
    expect(extractFromDefaultTheme('nope', THEME, false)).toBe('');
  });

  it('returns an empty string when the theme lacks the tag', () => {
    expect(extractFromDefaultTheme('objs', '<qsp-player></qsp-player>', false)).toBe('');
  });

  it('is not fooled by <qsp-main-content> when asked for <qsp-main>', () => {
    const theme = '<qsp-main-content class="c"></qsp-main-content><qsp-main class="m"><p>x</p></qsp-main>';
    expect(extractFromDefaultTheme('desc', theme, false)).toBe('<qsp-main><p>x</p></qsp-main>');
  });

  it('finds no main pane when the theme only has <qsp-main-content>', () => {
    expect(extractFromDefaultTheme('desc', '<qsp-main-content class="c"></qsp-main-content>', false)).toBe('');
  });
});

describe('buildGuiLayoutTemplate', () => {
  const OBJS =
    '<qsp-cl-pane visibility="objs" proportion="39931"><qsp-objects><div>objs</div></qsp-objects></qsp-cl-pane>';
  const ACTS =
    '<qsp-cl-pane visibility="acts" proportion="177418"><qsp-actions><div>acts</div></qsp-actions></qsp-cl-pane>';
  const VARS = '<qsp-cl-pane visibility="vars" proportion="82651"><qsp-stats><div>vars</div></qsp-stats></qsp-cl-pane>';
  const INPUT = '<qsp-cl-pane visibility="input" proportion="100000"><qsp-cmd><div>cmd</div></qsp-cmd></qsp-cl-pane>';
  const DESC = `<qsp-cl-pane visibility="" proportion="100000">${MAIN}</qsp-cl-pane>`;
  const VIEW =
    '<qsp-cl-pane visibility="imgview" proportion="100000"><qsp-view modal><div>view</div></qsp-view></qsp-cl-pane>';

  it('builds the classic default layout with the floating image pane last', () => {
    expect(buildGuiLayoutTemplate(parseCfg(CLASSIC_CFG), THEME)).toBe(
      '<qsp-cl-layer>' +
        '<qsp-cl-layer>' +
        `<qsp-cl-dock place="center">${DESC}</qsp-cl-dock>` +
        `<qsp-cl-dock place="right" visibility="vars" size="351">${VARS}</qsp-cl-dock>` +
        `<qsp-cl-dock place="bottom" visibility="acts|objs" size="251">${ACTS}${OBJS}</qsp-cl-dock>` +
        '</qsp-cl-layer>' +
        `<qsp-cl-dock place="bottom" visibility="input" size="22">${INPUT}</qsp-cl-dock>` +
        '</qsp-cl-layer>' +
        VIEW,
    );
  });

  it('D6: gives an empty template for a cfg with no Panels line', () => {
    const cfg = parseCfg('[Colors]\nBackColor=14737632\n[Font]\nFontSize=12');
    expect(cfg.Panels).toBeUndefined();
    expect(buildGuiLayoutTemplate(cfg, THEME)).toBe('');
  });
});

describe('panels with incomplete data', () => {
  const withPanels = (panels: string) => parseCfg(`[General]\nPanels=layout2|${panels}|`);
  const DESC_DOCK = `<qsp-cl-dock place="center"><qsp-cl-pane visibility="" proportion="100000">${MAIN}</qsp-cl-pane></qsp-cl-dock>`;
  const OBJS_DOCK =
    '<qsp-cl-dock place="bottom" visibility="objs" size="9"><qsp-cl-pane visibility="objs" proportion="5"><qsp-objects><div>objs</div></qsp-objects></qsp-cl-pane></qsp-cl-dock>';
  /** The layout of a cfg whose only usable panel is desc. */
  const DESC_ONLY = `<qsp-cl-layer>${DESC_DOCK}</qsp-cl-layer>`;
  /** One layer: desc in the center, objs (besth=9, no dock size) in the bottom dock. */
  const DESC_AND_OBJS = `<qsp-cl-layer>${DESC_DOCK}${OBJS_DOCK}</qsp-cl-layer>`;

  it('D7: skips a panel with dir=0 instead of throwing', () => {
    const cfg = withPanels(
      'name=desc;state=768;dir=5;layer=0;row=0;pos=0;prop=100000;bestw=1;besth=1|name=objs;state=0;dir=0;layer=0;row=0;pos=1;prop=1;bestw=1;besth=1',
    );
    expect(() => buildGuiLayoutTemplate(cfg, THEME)).not.toThrow();
    expect(buildGuiLayoutTemplate(cfg, THEME)).toBe(DESC_ONLY);
  });

  it('D7: skips a panel with dir=6 instead of throwing', () => {
    const cfg = withPanels(
      'name=desc;state=768;dir=5;layer=0;row=0;pos=0;prop=100000;bestw=1;besth=1|name=objs;state=0;dir=6;layer=0;row=0;pos=1;prop=1;bestw=1;besth=1',
    );
    expect(() => buildGuiLayoutTemplate(cfg, THEME)).not.toThrow();
    expect(buildGuiLayoutTemplate(cfg, THEME)).toBe(DESC_ONLY);
  });

  it('D7: skips a panel with no dir instead of throwing', () => {
    const cfg = withPanels(
      'name=desc;state=768;dir=5;layer=0;row=0;pos=0;prop=100000;bestw=1;besth=1|name=objs;state=0;layer=0;row=0;pos=1;prop=1;bestw=1;besth=1',
    );
    expect(() => buildGuiLayoutTemplate(cfg, THEME)).not.toThrow();
    expect(buildGuiLayoutTemplate(cfg, THEME)).toBe(DESC_ONLY);
  });

  it('D7: puts a panel with no layer on layer 0 and keeps the layout', () => {
    const cfg = withPanels(
      'name=desc;state=768;dir=5;row=0;pos=0;prop=100000;bestw=1;besth=1|name=objs;state=0;dir=3;layer=0;row=0;pos=1;prop=5;bestw=1;besth=9',
    );
    expect(buildGuiLayoutTemplate(cfg, THEME)).toBe(DESC_AND_OBJS);
  });

  it('D8: escapes a double quote in a panel name', () => {
    const html = convertPane(panel({ name: 'a"b' as QspGUIPanel }), THEME, false);
    expect(html).toBe('<qsp-cl-pane visibility="a&quot;b" proportion="100000"></qsp-cl-pane>');
  });

  it('D8: escapes < and & in a panel name', () => {
    const html = convertPane(panel({ name: 'a<b&c' as QspGUIPanel }), THEME, false);
    expect(html).toBe('<qsp-cl-pane visibility="a&lt;b&amp;c" proportion="100000"></qsp-cl-pane>');
  });

  it('desc on an upper layer does not throw and still shows the main pane', () => {
    const cfg = withPanels(
      'name=desc;state=768;dir=5;layer=1;row=0;pos=0;prop=100000;bestw=1;besth=1|name=objs;state=0;dir=3;layer=0;row=0;pos=0;prop=5;bestw=1;besth=9',
    );
    expect(() => buildGuiLayoutTemplate(cfg, THEME)).not.toThrow();
    expect(buildGuiLayoutTemplate(cfg, THEME)).toBe(DESC_AND_OBJS);
  });

  it('desc alone on layer 1 does not throw and still shows the main pane', () => {
    const cfg = withPanels('name=desc;state=768;dir=5;layer=1;row=0;pos=0;prop=100000;bestw=1;besth=1');
    expect(() => buildGuiLayoutTemplate(cfg, THEME)).not.toThrow();
    expect(buildGuiLayoutTemplate(cfg, THEME)).toBe(DESC_ONLY);
  });

  it('D8: escapes a double quote in the dock visibility list', () => {
    expect(convertDock('right', [panel({ name: 'a"b' as QspGUIPanel })], {}, THEME)).toBe(
      '<qsp-cl-dock place="right" visibility="a&quot;b" size="300"><qsp-cl-pane visibility="a&quot;b" proportion="100000"></qsp-cl-pane></qsp-cl-dock>',
    );
  });
});
