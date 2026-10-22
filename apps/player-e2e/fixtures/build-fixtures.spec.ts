import { existsSync, readFileSync } from 'node:fs';
import { readQsp } from '@qsp/converters';
import { beforeAll, describe, expect, it } from 'vitest';
import { ARCHIVES } from './archives';
import { unzipSync } from 'fflate';
import { buildFixtures } from './build-fixtures';
import { DIALOGS } from './dialogs-game';
import { GAME_HTML } from './game-html-game';
import { PANELS_GAME } from './panels-game';
import { SAVES_GAME } from './saves-game';
import { AERO_GAME, CORE_THEME_VARIANTS, GUI_CFG_GAME, MISSING_THEME_GAME, THEMED_GAME } from './themes-game';

const bytes = (path: string): Uint8Array => new Uint8Array(readFileSync(path));
const startsWith = (path: string, magic: number[]): boolean => magic.every((b, i) => bytes(path)[i] === b);

describe('buildFixtures', () => {
  beforeAll(async () => {
    await buildFixtures();
  }, 60_000);

  it('writes every archive', () => {
    for (const { path } of Object.values(ARCHIVES)) expect(existsSync(path), path).toBe(true);
  });

  it('writes zips with the ZIP magic', () => {
    for (const { path } of [
      ARCHIVES.singleZip,
      ARCHIVES.multiZip,
      ARCHIVES.includerZip,
      ARCHIVES.dialogsZip,
      ARCHIVES.gameHtmlZip,
    ]) {
      expect(startsWith(path, [0x50, 0x4b]), path).toBe(true);
    }
  });

  it('writes the 7z with the 7z magic', () => {
    expect(startsWith(ARCHIVES.sevenZip.path, [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c])).toBe(true);
  });

  it('writes a .qsp that parses back to the source location', () => {
    const data = bytes(ARCHIVES.qspBinary.path);
    expect(data.length).toBeGreaterThan(0);
    const locations = readQsp(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer);
    expect(locations.map((l) => l.name)).toEqual(['start']);
  });

  it('packs the dialogs game with its view image and a valid PNG', () => {
    expect(DIALOGS.path).toBe(ARCHIVES.dialogsZip.path);
    const files = unzipSync(bytes(ARCHIVES.dialogsZip.path));
    expect(Object.keys(files).sort()).toEqual(['dialogs.qsps', 'game.cfg', DIALOGS.viewImage].sort());
    expect([...files[DIALOGS.viewImage].slice(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it('packs the game-html game with its image', () => {
    expect(GAME_HTML.path).toBe(ARCHIVES.gameHtmlZip.path);
    const files = unzipSync(bytes(ARCHIVES.gameHtmlZip.path));
    expect(Object.keys(files).sort()).toEqual(['game-html.qsps', 'game.cfg', GAME_HTML.image].sort());
  });

  it('packs the saves game as a zip', () => {
    expect(SAVES_GAME.path).toBe(ARCHIVES.savesZip.path);
    expect(startsWith(ARCHIVES.savesZip.path, [0x50, 0x4b, 0x03, 0x04])).toBe(true);
    const files = unzipSync(bytes(ARCHIVES.savesZip.path));
    expect(Object.keys(files).sort()).toEqual(['game.cfg', 'saves.qsps']);
  });

  it('packs the panels game with its object image, a valid PNG and its library', () => {
    expect(PANELS_GAME.path).toBe(ARCHIVES.panelsZip.path);
    expect(startsWith(ARCHIVES.panelsZip.path, [0x50, 0x4b, 0x03, 0x04])).toBe(true);
    const files = unzipSync(bytes(ARCHIVES.panelsZip.path));
    expect(Object.keys(files).sort()).toEqual(['game.cfg', 'obj.png', 'panels-lib.qsps', 'panels.qsps']);
    expect([...files['obj.png'].slice(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  const entries = (path: string): string[] => {
    expect(startsWith(path, [0x50, 0x4b, 0x03, 0x04]), path).toBe(true);
    return Object.keys(unzipSync(bytes(path))).sort();
  };
  const text = (path: string, file: string): string => new TextDecoder().decode(unzipSync(bytes(path))[file]);

  it('packs the aero game in Aero mode', () => {
    expect(AERO_GAME.path).toBe(ARCHIVES.aeroZip.path);
    expect(entries(AERO_GAME.path)).toEqual(['aero-game.qsps', 'game.cfg']);
    expect(text(AERO_GAME.path, 'game.cfg')).toContain('mode = "aero"');
  });

  it('packs the themed game with its theme html, css and script', () => {
    expect(THEMED_GAME.path).toBe(ARCHIVES.themedZip.path);
    expect(entries(THEMED_GAME.path)).toEqual(
      ['e2e-theme.css', 'e2e-theme.html', 'e2e-theme.js', 'game.cfg', 'themed-game.qsps'].sort(),
    );
    expect(text(THEMED_GAME.path, 'e2e-theme.html')).toContain('<qspider-theme name="e2e-custom">');
    expect(text(THEMED_GAME.path, 'game.cfg')).toContain('defaultTheme = "e2e-custom"');
  });

  it('packs the missing-theme games with an unregistered defaultTheme, one in Aero mode', () => {
    expect(entries(MISSING_THEME_GAME.aeroPath)).toEqual(['game.cfg', 'missing-theme.qsps']);
    expect(entries(MISSING_THEME_GAME.classicPath)).toEqual(['game.cfg', 'missing-theme.qsps']);
    const aero = text(MISSING_THEME_GAME.aeroPath, 'game.cfg');
    const classic = text(MISSING_THEME_GAME.classicPath, 'game.cfg');
    expect(aero).toContain(`defaultTheme = "${MISSING_THEME_GAME.missingTheme}"`);
    expect(aero).toContain('mode = "aero"');
    expect(classic).toContain(`defaultTheme = "${MISSING_THEME_GAME.missingTheme}"`);
    expect(classic).not.toContain('mode =');
  });

  it('packs the gui-cfg game with its qspgui.cfg', () => {
    expect(GUI_CFG_GAME.path).toBe(ARCHIVES.guiCfgZip.path);
    expect(entries(GUI_CFG_GAME.path)).toEqual(['game.cfg', 'gui-cfg-game.qsps', 'qspgui.cfg']);
    expect(text(GUI_CFG_GAME.path, 'qspgui.cfg')).toContain('Panels=layout2|');
  });

  it('packs the gui-cfg control without the qspgui.cfg', () => {
    expect(GUI_CFG_GAME.controlPath).toBe(ARCHIVES.guiCfgControlZip.path);
    expect(entries(GUI_CFG_GAME.controlPath)).toEqual(['game.cfg', 'gui-cfg-game.qsps']);
  });

  it('packs the e2e game once per core theme variant, with distinct ids', () => {
    const [aero, custom] = CORE_THEME_VARIANTS;
    expect(entries(aero.e2eGamePath)).toEqual(['e2e-game.qsps', 'game.cfg']);
    expect(text(aero.e2eGamePath, 'game.cfg')).toContain('mode = "aero"');
    expect(entries(custom.e2eGamePath)).toEqual(
      ['e2e-game.qsps', 'e2e-theme.css', 'e2e-theme.html', 'e2e-theme.js', 'game.cfg'].sort(),
    );
    expect(text(custom.e2eGamePath, 'game.cfg')).toContain('themes = ["e2e-theme.html"]');
    const ids = [aero, custom].map((v) => /id = "(.*)"/.exec(text(v.e2eGamePath, 'game.cfg'))?.[1]);
    expect(new Set([...ids, 'e2e-game', 'e2e-second-game']).size).toBe(4);
  });
});
