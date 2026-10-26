import { describe, expect, it } from 'vitest';
import {
  classicDefaultRules,
  isDockVisible,
  isLayerDockVisible,
  isPaneVisible,
  layerGridStyle,
} from './classic-layout-style';

const onlyActs = (panel: string) => panel === 'acts';

describe('layerGridStyle', () => {
  it('gives a lone centre area the whole grid', () => {
    expect(layerGridStyle({})).toEqual({
      gridTemplateColumns: '1fr',
      gridTemplateRows: '1fr',
      gridTemplateAreas: '"center"',
    });
  });

  it('puts left and right docks beside the centre', () => {
    const style = layerGridStyle({ left: { size: 100 }, right: { size: 50 } });
    expect(style.gridTemplateColumns).toBe('100px 1fr 50px');
    expect(style.gridTemplateAreas).toBe('"left center right"');
  });

  it('spans top and bottom docks across every column', () => {
    const style = layerGridStyle({
      left: { size: 100 },
      right: { size: 50 },
      top: { size: 20 },
      bottom: { size: 30 },
    });
    expect(style.gridTemplateRows).toBe('20px 1fr 30px');
    expect(style.gridTemplateAreas).toBe('"top top top" "left center right" "bottom bottom bottom"');
  });

  it('adds a single top row above the centre', () => {
    expect(layerGridStyle({ top: { size: 20 } }).gridTemplateAreas).toBe('"top" "center"');
  });
});

describe('isDockVisible', () => {
  it('shows a dock without visibility', () => {
    expect(isDockVisible(null, () => false)).toBe(true);
  });

  it('shows a dock when any listed panel is visible', () => {
    expect(isDockVisible('objs|acts', onlyActs)).toBe(true);
  });

  it('hides a dock whose panels are unknown or hidden', () => {
    expect(isDockVisible('nope', onlyActs)).toBe(false);
  });

  it('shows a dock with an empty visibility, as with none', () => {
    expect(isDockVisible('', () => false)).toBe(true);
  });
});

describe('isLayerDockVisible', () => {
  it('shows a dock without visibility', () => {
    expect(isLayerDockVisible(null, () => false)).toBe(true);
  });

  it('hides a dock with an empty visibility, unlike isDockVisible (maintainer decision)', () => {
    expect(isLayerDockVisible('', onlyActs)).toBe(false);
  });

  it('shows a dock when any listed panel is visible', () => {
    expect(isLayerDockVisible('objs|acts', onlyActs)).toBe(true);
  });

  it('hides a dock whose panels are unknown or hidden', () => {
    expect(isLayerDockVisible('nope', onlyActs)).toBe(false);
  });
});

describe('isPaneVisible', () => {
  it('shows a pane with an empty visibility', () => {
    expect(isPaneVisible('', () => false)).toBe(true);
  });

  it('follows the single named panel', () => {
    expect(isPaneVisible('objs', (panel) => panel === 'objs')).toBe(true);
    expect(isPaneVisible('objs', onlyActs)).toBe(false);
  });
});

describe('classicDefaultRules', () => {
  const empty = { BackColor: 0, FontColor: 0, LinkColor: 0, FontSize: 0, FontName: '' };

  it('writes no rules for an empty config', () => {
    expect(classicDefaultRules(empty)).toEqual([]);
  });

  it('writes the four background rules for a real BackColor', () => {
    expect(classicDefaultRules({ ...empty, BackColor: 0xff0000 })).toEqual([
      '--cl-background-color: rgb(0,0,255)',
      '--cl-background-color-contrast: white',
      '--cl-background-color-inverted: #FFFF00',
      '--cl-background-color-inverted-contrast: black',
    ]);
  });

  it('writes font colour and link colour rules', () => {
    const rules = classicDefaultRules({ ...empty, FontColor: 0xff0000, LinkColor: 0x0000ff });
    expect(rules).toEqual(['--cl-color: rgb(0,0,255)', '--cl-link-color: rgb(255,0,0)']);
  });

  it('writes the font size in points', () => {
    expect(classicDefaultRules({ ...empty, FontSize: 12 })).toEqual(['--cl-font-size: 12pt']);
  });

  it('writes the font name', () => {
    expect(classicDefaultRules({ ...empty, FontName: 'Georgia' })).toEqual(['--cl-font-name: Georgia']);
  });
});
