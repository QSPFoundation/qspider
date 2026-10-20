// Builds the web test pack: a zip of game.cfg and the games it lists, which the web player
// imports through its Open game input (OperateWebPlayer.loadTestPack).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parse } from '@iarna/toml';
import { zipSync, type Zippable } from 'fflate';
import { TEST_PACK } from '../../fixtures/test-pack';

/** game.cfg and every file its [[game]] entries list, keyed by zip path (relative to game.cfg). */
function packFiles(configPath: string): Zippable {
  const config = readFileSync(configPath);
  const { game = [] } = parse(config.toString('utf8')) as { game?: { file: string }[] };
  if (game.length === 0) throw new Error(`${configPath} lists no games`);
  const files: Zippable = { 'game.cfg': config };
  for (const { file } of game) files[file] = readFileSync(join(dirname(configPath), file));
  return files;
}

export default function globalSetup(): void {
  mkdirSync(dirname(TEST_PACK.zipPath), { recursive: true });
  writeFileSync(TEST_PACK.zipPath, zipSync(packFiles(TEST_PACK.configPath)));
}
