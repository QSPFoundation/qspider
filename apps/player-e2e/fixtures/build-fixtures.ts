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

  const singleSource = readFileSync(join(SOURCES.single, 'single.qsps'), 'utf8');
  write(ARCHIVES.qspBinary.path, writeQsp(readQsps(singleSource)));

  write(ARCHIVES.sevenZip.path, await sevenZipPack(packFiles(singleConfig)));
}
