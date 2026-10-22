// Builds the derived open-route fixtures (zips, 7z, compiled .qsp) into artifacts/fixtures/.
// Runs at setup only (web global-setup, desktop onPrepare), so it may use node/build libraries.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parse } from '@iarna/toml';
import { readQsps, writeQsp } from '@qsp/converters';
import { zipSync, type Zippable } from 'fflate';
import SevenZip from '7z-wasm';
import { ARCHIVES, SOURCES } from './archives';
import { TEST_PACK } from './test-pack';

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

/** Writes every ARCHIVES fixture. Idempotent: outputs are overwritten. */
export async function buildFixtures(): Promise<void> {
  // The test pack itself, imported by the web player through its Open game input.
  write(TEST_PACK.zipPath, zipPack(TEST_PACK.configPath));

  const singleConfig = join(SOURCES.single, 'game.cfg');
  write(ARCHIVES.singleZip.path, zipPack(singleConfig));
  write(ARCHIVES.multiZip.path, zipPack(TEST_PACK.configPath));
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

  const singleSource = readFileSync(join(SOURCES.single, 'single.qsps'), 'utf8');
  write(ARCHIVES.qspBinary.path, writeQsp(readQsps(singleSource)));

  write(ARCHIVES.sevenZip.path, await sevenZipPack(packFiles(singleConfig)));
}
