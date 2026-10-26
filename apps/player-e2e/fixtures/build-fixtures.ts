// Builds the derived open-route fixtures (zips, 7z, compiled .qsp) into artifacts/fixtures/.
// Runs at setup only (web global-setup, desktop onPrepare), so it may use node/build libraries.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parse } from '@iarna/toml';
import { readQsps, writeQsp } from '@qsp/converters';
import { zipSync, type Zippable } from 'fflate';
import SevenZip from '7z-wasm';
import { deflateSync, crc32 } from 'node:zlib';
import { ARCHIVES, SOURCES } from './archives';
import { LOOK_IMAGES } from './look-game';
import { quietWav, squareFont } from './resource-assets';
import { RESOURCES_GAME, RESOURCES_IMAGES, RESOURCES_SVGS } from './resources-game';
import { TEST_PACK } from './test-pack';
import { utf16 } from './utf16';

const THEME_FILES = ['e2e-theme.html', 'e2e-theme.css', 'e2e-theme.js'];

/** game.cfg and every file its [[game]] entries list, keyed by path relative to game.cfg. */
function packFiles(configPath: string, extraFiles: string[] = []): Record<string, Uint8Array> {
  const config = readFileSync(configPath);
  const { game = [] } = parse(config.toString('utf8')) as { game?: { file: string }[] };
  if (game.length === 0) throw new Error(`${configPath} lists no games`);
  const files: Record<string, Uint8Array> = { 'game.cfg': config };
  for (const file of [...game.map((g) => g.file), ...extraFiles])
    files[file] = readFileSync(join(dirname(configPath), file));
  return files;
}

/** Zip of an authored game.cfg text and files read from folders (`[folder, name]`, packed under `name`). */
function zipWithConfig(cfg: string, files: [folder: string, name: string][]): Uint8Array {
  const entries: Record<string, Uint8Array> = { 'game.cfg': new TextEncoder().encode(cfg) };
  for (const [folder, name] of files) entries[name] = readFileSync(join(folder, name));
  return zipSync(entries as Zippable);
}

/** A fully transparent RGBA PNG of exactly the given natural size (it may cover the UI without hiding it). */
export function transparentPng(width: number, height: number): Uint8Array {
  const chunk = (type: string, data: Uint8Array): Buffer => {
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const checksum = Buffer.alloc(4);
    checksum.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, checksum]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 6, 0, 0, 0], 8); // 8 bit, RGBA, deflate, no filter method, no interlace
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(width * 4)]); // filter 0, every pixel transparent black
  const pixels = Buffer.concat(Array.from({ length: height }, () => row));
  return new Uint8Array(
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk('IHDR', header),
      chunk('IDAT', deflateSync(pixels)),
      chunk('IEND', Buffer.alloc(0)),
    ]),
  );
}

/** game.cfg text for the e2e game with the given theme settings. */
function e2eGameConfig(id: string, title: string, themeLines: string[]): string {
  return ['[[game]]', `id = "${id}"`, `title = "${title}"`, 'file = "e2e-game.qsps"', ...themeLines, ''].join('\n');
}

/** Zip of a game.cfg and the games it lists. */
export function zipPack(configPath: string, extraFiles: string[] = []): Uint8Array {
  return zipSync(packFiles(configPath, extraFiles) as Zippable);
}

function write(path: string, data: Uint8Array | ArrayBuffer): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, data instanceof ArrayBuffer ? new Uint8Array(data) : data);
}

async function sevenZipPack(files: Record<string, Uint8Array>): Promise<Uint8Array> {
  const sevenZip = await SevenZip();
  const names = Object.keys(files);
  for (const name of names) sevenZip.FS.writeFile(name, files[name]);
  sevenZip.callMain(['a', 'out.7z', ...names]);
  return sevenZip.FS.readFile('out.7z');
}

/** Files of the resources game by path: authored text files plus the generated PNGs, WAVs and font. */
function resourcesFiles(): Record<string, Uint8Array> {
  const files: Record<string, Uint8Array> = {
    'resources-game.qsps': readFileSync(join(SOURCES.resources, 'resources-game.qsps')),
  };
  for (const name of [...RESOURCES_GAME.cfg.styles, ...RESOURCES_GAME.cfg.scripts])
    files[name] = readFileSync(join(SOURCES.resources, name));
  files[RESOURCES_GAME.relativeText.path] = readFileSync(join(SOURCES.resources, RESOURCES_GAME.relativeText.path));
  for (const [name, [w, h]] of Object.entries(RESOURCES_IMAGES)) files[name] = transparentPng(w, h);
  for (const [name, [w, h]] of Object.entries(RESOURCES_SVGS))
    files[name] = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#08c"/></svg>`,
    );
  files[RESOURCES_GAME.sound.a] = quietWav(RESOURCES_GAME.sound.seconds, 440);
  files[RESOURCES_GAME.sound.b] = quietWav(RESOURCES_GAME.sound.seconds, 330);
  files[RESOURCES_GAME.cfg.font.path] = squareFont();
  return files;
}

/** Writes every ARCHIVES fixture. Idempotent: outputs are overwritten. */
export async function buildFixtures(): Promise<void> {
  // The test pack itself, imported by the web player through its Open game input.
  write(TEST_PACK.zipPath, zipPack(TEST_PACK.configPath));

  const singleConfig = join(SOURCES.single, 'game.cfg');
  write(ARCHIVES.singleZip.path, zipPack(singleConfig));
  write(
    ARCHIVES.tripleZip.path,
    zipSync({
      'game.cfg': readFileSync(join(SOURCES.triple, 'game.cfg')),
      'one/single.qsps': readFileSync(join(SOURCES.single, 'single.qsps')),
      'two/aero-game.qsps': readFileSync(join(SOURCES.aero, 'aero-game.qsps')),
      'three/game.qsps': readFileSync(join(SOURCES.second, 'game.qsps')),
    } as Zippable),
  );
  write(
    ARCHIVES.flatMultiZip.path,
    zipSync({
      'game.cfg': readFileSync(join(SOURCES.flatMulti, 'game.cfg')),
      'single.qsps': readFileSync(join(SOURCES.single, 'single.qsps')),
      'aero-game.qsps': readFileSync(join(SOURCES.aero, 'aero-game.qsps')),
      'game.qsps': readFileSync(join(SOURCES.second, 'game.qsps')),
    } as Zippable),
  );
  const utf16Files = {
    'game.cfg': utf16(readFileSync(join(SOURCES.utf16, 'game.cfg'), 'utf8')),
    'utf16.qsps': readFileSync(join(SOURCES.utf16, 'utf16.qsps')),
    'css/utf16.css': readFileSync(join(SOURCES.utf16, 'css/utf16.css')),
  };
  write(ARCHIVES.utf16Zip.path, zipSync(utf16Files as Zippable));
  for (const [name, data] of Object.entries(utf16Files))
    write(join(dirname(ARCHIVES.utf16Folder.configPath), name), data);
  write(ARCHIVES.includerZip.path, zipPack(join(SOURCES.includer, 'game.cfg'), ['included.qsps']));
  write(ARCHIVES.dialogsZip.path, zipPack(join(SOURCES.dialogs, 'game.cfg'), [ARCHIVES.dialogsZip.image]));
  write(ARCHIVES.gameHtmlZip.path, zipPack(join(SOURCES.gameHtml, 'game.cfg'), [ARCHIVES.gameHtmlZip.image]));
  write(ARCHIVES.savesZip.path, zipPack(join(SOURCES.saves, 'game.cfg')));
  write(ARCHIVES.panelsZip.path, zipPack(join(SOURCES.panels, 'game.cfg'), ['obj.png', 'panels-lib.qsps']));

  write(ARCHIVES.aeroZip.path, zipPack(join(SOURCES.aero, 'game.cfg')));
  write(ARCHIVES.themedZip.path, zipPack(join(SOURCES.themed, 'game.cfg'), THEME_FILES));
  write(ARCHIVES.guiCfgZip.path, zipPack(join(SOURCES.guiCfg, 'game.cfg'), ['qspgui.cfg']));
  write(ARCHIVES.guiCfgControlZip.path, zipPack(join(SOURCES.guiCfg, 'game.cfg')));
  for (const [archive, cfg] of [
    [ARCHIVES.missingAeroZip, 'missing-aero.cfg'],
    [ARCHIVES.missingClassicZip, 'missing-classic.cfg'],
  ] as const) {
    const config = readFileSync(join(SOURCES.missingTheme, cfg), 'utf8');
    write(archive.path, zipWithConfig(config, [[SOURCES.missingTheme, 'missing-theme.qsps']]));
  }
  const lookImages = Object.fromEntries(
    Object.entries(LOOK_IMAGES).map(([name, [w, h]]) => [name, transparentPng(w, h)]),
  );
  for (const [archive, cfg] of [
    [ARCHIVES.lookAeroZip, 'game-aero.cfg'],
    [ARCHIVES.lookClassicZip, 'game-classic.cfg'],
  ] as const) {
    const entries = {
      'game.cfg': readFileSync(join(SOURCES.look, cfg)),
      'look-game.qsps': readFileSync(join(SOURCES.look, 'look-game.qsps')),
      ...lookImages,
    };
    write(archive.path, zipSync(entries as Zippable));
  }
  const resources = resourcesFiles();
  for (const [archive, cfg] of [
    [ARCHIVES.resourcesZip, 'game.cfg'],
    [ARCHIVES.resourcesMissingZip, 'game-missing.cfg'],
  ] as const) {
    write(archive.path, zipSync({ 'game.cfg': readFileSync(join(SOURCES.resources, cfg)), ...resources } as Zippable));
  }
  for (const [archive, cfg] of [
    [ARCHIVES.externalThemeZip, 'game.cfg'],
    [ARCHIVES.externalTheme404Zip, 'game-404.cfg'],
  ] as const) {
    const config = readFileSync(join(SOURCES.externalTheme, cfg), 'utf8');
    write(archive.path, zipWithConfig(config, [[SOURCES.externalTheme, 'external-theme.qsps']]));
  }
  // The plain folder keeps the real case on disk (the archives are lowercased by the players).
  const folder = dirname(ARCHIVES.resourcesFolder.path);
  write(join(folder, 'game.cfg'), readFileSync(join(SOURCES.resources, 'game.cfg')));
  for (const [name, data] of Object.entries(resources)) write(join(folder, name), data);
  const e2eGame: [string, string] = [SOURCES.e2eGame, 'e2e-game.qsps'];
  const aeroConfig = e2eGameConfig('e2e-game-aero', ARCHIVES.e2eGameAeroZip.title, ['mode = "aero"']);
  write(ARCHIVES.e2eGameAeroZip.path, zipWithConfig(aeroConfig, [e2eGame]));
  const customConfig = e2eGameConfig('e2e-game-custom', ARCHIVES.e2eGameCustomZip.title, [
    'themes = ["e2e-theme.html"]',
    'defaultTheme = "e2e-custom"',
  ]);
  write(
    ARCHIVES.e2eGameCustomZip.path,
    zipWithConfig(customConfig, [e2eGame, ...THEME_FILES.map((f): [string, string] => [SOURCES.themed, f])]),
  );

  for (const [archive, v] of [
    [ARCHIVES.reimportV1Zip, 'v1'],
    [ARCHIVES.reimportV2Zip, 'v2'],
  ] as const) {
    const config = readFileSync(join(SOURCES.reimport, `${v}.cfg`), 'utf8');
    write(archive.path, zipWithConfig(config, [[SOURCES.reimport, `reimport-${v}.qsps`]]));
  }

  const singleSource = readFileSync(join(SOURCES.single, 'single.qsps'), 'utf8');
  write(ARCHIVES.qspBinary.path, writeQsp(readQsps(singleSource)));

  write(ARCHIVES.sevenZip.path, await sevenZipPack(packFiles(singleConfig)));
}
