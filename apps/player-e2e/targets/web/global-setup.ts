// Builds the web test pack: a zip of the fixture folder (game.cfg and the games it lists), which
// the web player imports through its Open game input (OperateWebPlayer.loadTestPack).
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { zipSync, type Zippable } from 'fflate';
import { TEST_PACK } from '../../fixtures/test-pack';

/** Every file under `dir`, except the TypeScript constants modules, keyed by its zip path. */
function packFiles(dir: string, root: string = dir): Zippable {
  const files: Zippable = {};
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) Object.assign(files, packFiles(path, root));
    else if (!entry.name.endsWith('.ts')) files[relative(root, path).split(sep).join('/')] = readFileSync(path);
  }
  return files;
}

export default function globalSetup(): void {
  mkdirSync(dirname(TEST_PACK.zipPath), { recursive: true });
  writeFileSync(TEST_PACK.zipPath, zipSync(packFiles(dirname(TEST_PACK.configPath))));
}
