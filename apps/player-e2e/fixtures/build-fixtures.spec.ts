import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readQsp } from '@qsp/converters';
import { beforeAll, describe, expect, it } from 'vitest';
import { ARCHIVES } from './archives';
import { unzipSync } from 'fflate';
import { buildFixtures } from './build-fixtures';
import { DIALOGS } from './dialogs-game';
import { GAME_HTML } from './game-html-game';
import { LOOK_AERO_TABLE, LOOK_CLASSIC_TABLE, LOOK_GAME, LOOK_IMAGES } from './look-game';
import { PANELS_GAME } from './panels-game';
import { RESOURCES_GAME, RESOURCES_IMAGES, RESOURCES_SVGS } from './resources-game';
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

  it('packs the look game once per theme mode, with every generated PNG at its natural size', () => {
    expect(LOOK_GAME.aeroPath).toBe(ARCHIVES.lookAeroZip.path);
    expect(LOOK_GAME.classicPath).toBe(ARCHIVES.lookClassicZip.path);
    const expected = ['game.cfg', 'look-game.qsps', ...Object.keys(LOOK_IMAGES)].sort();
    expect(entries(LOOK_GAME.aeroPath)).toEqual(expected);
    expect(entries(LOOK_GAME.classicPath)).toEqual(expected);
    expect(text(LOOK_GAME.aeroPath, 'game.cfg')).toContain('mode = "aero"');
    expect(text(LOOK_GAME.classicPath, 'game.cfg')).not.toContain('mode =');
    const files = unzipSync(bytes(LOOK_GAME.aeroPath));
    for (const [name, [width, height]] of Object.entries(LOOK_IMAGES)) {
      const png = new DataView(files[name].buffer, files[name].byteOffset, files[name].byteLength);
      expect(png.getUint32(0), name).toBe(0x89504e47);
      expect([png.getUint32(16), png.getUint32(20)], name).toEqual([width, height]);
    }
  });

  describe('look tables', () => {
    const themeFile = (name: string): string =>
      readFileSync(fileURLToPath(new URL(`../../../public/themes/${name}.html`, import.meta.url)), 'utf8');

    /** Names a theme declares with `qsp-css-variable`, plus the ones css-variables.tsx derives from the attributes. */
    function declaredNames(html: string): string[] {
      const names: string[] = [];
      for (const [, attributes] of html.matchAll(/<qsp-css-variable\b([^>]*)>/g)) {
        const name = /\bname="([^"]*)"/.exec(attributes)?.[1];
        if (!name) throw new Error(`qsp-css-variable without a name: ${attributes}`);
        const flags = attributes.replace(/"[^"]*"/g, '""'); // attribute names only, not values
        const has = (attribute: string): boolean => new RegExp(`\\b${attribute}\\b`).test(flags);
        const type = /\btype="([^"]*)"/.exec(attributes)?.[1];
        names.push(name);
        if (type === 'color') {
          if (has('with-contrast')) names.push(`${name}-contrast`);
          if (has('with-inverted')) {
            names.push(`${name}-inverted`);
            if (has('with-contrast')) names.push(`${name}-inverted-contrast`);
          }
        }
        if (type === 'resource' && has('with-size')) names.push(`${name}-w`, `${name}-h`);
      }
      return names;
    }

    it('LOOK_AERO_TABLE has exactly the variables aero.html declares and derives', () => {
      expect(Object.keys(LOOK_AERO_TABLE).sort()).toEqual(declaredNames(themeFile('aero')).sort());
    });

    it('LOOK_CLASSIC_TABLE has exactly the variables classic.html declares and derives', () => {
      expect(Object.keys(LOOK_CLASSIC_TABLE).sort()).toEqual(declaredNames(themeFile('classic')).sort());
    });
  });

  describe('resources game', () => {
    const source = (name: string): string =>
      readFileSync(fileURLToPath(new URL(`./resources-game/${name}`, import.meta.url)), 'utf8');
    const folder = dirname(RESOURCES_GAME.folderGamePath);
    const zipFiles = (path: string): Record<string, Uint8Array> => unzipSync(bytes(path));
    const wrongCase = RESOURCES_GAME.images.wrongCase.src;

    /** Every asset path the game, the styles and the cfg name, normalised like the player does (`\\` to `/`, no query). */
    function referencedAssets(): string[] {
      const sources = [source('resources-game.qsps'), source('game.cfg'), source('css/one.css'), source('css/Two.css')];
      const found = new Set<string>();
      for (const text of sources)
        for (const [, ref] of text.matchAll(/['":]((?:[Ii]mg|snd|css|js|fonts)[\\/][^'"?<>]*)/g))
          found.add(ref.replaceAll('\\', '/'));
      return [...found];
    }

    it('names every asset it uses, and each exists in the zip and in the plain folder with the intended case', () => {
      const zipped = zipFiles(RESOURCES_GAME.zipPath);
      const refs = referencedAssets().filter((ref) => ref !== wrongCase);
      expect(refs.length).toBe(17);
      for (const ref of refs) {
        expect(ref in zipped, `zip: ${ref}`).toBe(true);
        expect(existsSync(join(folder, ref)), `folder: ${ref}`).toBe(true);
      }
    });

    it('has the wrong-case reference only as a case-insensitive match', () => {
      const zipped = zipFiles(RESOURCES_GAME.zipPath);
      const real = RESOURCES_GAME.images.wrongCase.file;
      expect(wrongCase).not.toBe(real);
      expect(wrongCase.toLowerCase()).toBe(real.toLowerCase());
      expect(wrongCase in zipped).toBe(false);
      expect(real in zipped).toBe(true);
      expect(existsSync(join(folder, wrongCase))).toBe(false);
    });

    it('spells every authored image in the game as the constants say', () => {
      const game = source('resources-game.qsps');
      for (const { qa, src, file } of Object.values(RESOURCES_GAME.images)) {
        expect(game, qa).toContain(`<img data-qa="${qa}" src="${src}">`);
        expect(src.replaceAll('\\', '/').split('?')[0].toLowerCase(), qa).toBe(file.toLowerCase());
      }
      expect(game).toContain(`'${RESOURCES_GAME.dataImage}'`);
      expect(game).toContain(`$BACKIMAGE = '${RESOURCES_GAME.externalImage}'`);
      expect(game).toContain(`play '${RESOURCES_GAME.externalSound}'`);
      expect(game).toContain(`play '${RESOURCES_GAME.sound.backslashB}'`);
    });

    it('packs the archive with the cfg, the game, every generated asset at its size, and the zip entries in UTF-8', () => {
      const zipped = zipFiles(RESOURCES_GAME.zipPath);
      expect(startsWith(RESOURCES_GAME.zipPath, [0x50, 0x4b, 0x03, 0x04])).toBe(true);
      expect(text(RESOURCES_GAME.zipPath, 'game.cfg')).toContain('scripts = ["js/one.js", "js/Two.js"]');
      expect(Object.keys(zipped)).toContain(RESOURCES_GAME.files.cyrillic);
      for (const [name, [width, height]] of Object.entries(RESOURCES_IMAGES)) {
        const png = new DataView(zipped[name].buffer, zipped[name].byteOffset, zipped[name].byteLength);
        expect([png.getUint32(0), png.getUint32(16), png.getUint32(20)], name).toEqual([0x89504e47, width, height]);
      }
      for (const [name, [width, height]] of Object.entries(RESOURCES_SVGS)) {
        const svg = Buffer.from(zipped[name]).toString('utf8');
        expect(svg, name).toContain(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`);
      }
      const sizes = Object.values(RESOURCES_IMAGES).map(([w]) => w);
      expect(new Set(sizes).size).toBe(sizes.length);
    });

    it('generates two distinct RIFF WAVs of the stated length and a TrueType font', () => {
      const zipped = zipFiles(RESOURCES_GAME.zipPath);
      for (const name of [RESOURCES_GAME.sound.a, RESOURCES_GAME.sound.b]) {
        const wav = Buffer.from(zipped[name]);
        expect([wav.toString('ascii', 0, 4), wav.toString('ascii', 8, 12), wav.readUInt32LE(24)], name).toEqual([
          'RIFF',
          'WAVE',
          8000,
        ]);
        expect(wav.length, name).toBe(44 + 8000 * RESOURCES_GAME.sound.seconds);
      }
      expect(
        Buffer.compare(Buffer.from(zipped[RESOURCES_GAME.sound.a]), Buffer.from(zipped[RESOURCES_GAME.sound.b])),
      ).not.toBe(0);
      const font = Buffer.from(zipped[RESOURCES_GAME.cfg.font.path]);
      expect(font.readUInt32BE(0)).toBe(0x00010000);
      expect(font.length).toBeLessThan(2048);
    });

    it('packs the missing variant with a script and a style that are not in the archive', () => {
      const zipped = zipFiles(RESOURCES_GAME.zipPath);
      const entriesOf = Object.keys(zipFiles(RESOURCES_GAME.missingZipPath));
      const cfg = text(RESOURCES_GAME.missingZipPath, 'game.cfg');
      expect(cfg).toContain(`"${RESOURCES_GAME.cfg.missingScript}"`);
      expect(cfg).toContain(`"${RESOURCES_GAME.cfg.missingStyle}"`);
      expect(entriesOf).not.toContain(RESOURCES_GAME.cfg.missingScript);
      expect(entriesOf).not.toContain(RESOURCES_GAME.cfg.missingStyle);
      expect(entriesOf.sort()).toEqual(Object.keys(zipped).sort());
      expect(RESOURCES_GAME.folderGamePath).toBe(ARCHIVES.resourcesFolder.path);
    });
  });
});
