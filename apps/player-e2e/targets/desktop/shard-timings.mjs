// Regenerates one platform's column of shard-timings.json (seconds per spec file) from CI job logs:
//   gh api repos/QSPFoundation/qspider/actions/runs/<id>/logs > l.zip; unzip l.zip
//   node apps/player-e2e/targets/desktop/shard-timings.mjs --platform linux|windows <job log .txt>...
// Windows has one log per shard; pass them all, they are merged. Only the named column is rewritten.
import console from 'node:console';
import { readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';
import { URL } from 'node:url';
import { parseSpecTimes } from './spec-times.ts';

const TABLE = new URL('./shard-timings.json', import.meta.url);
const PLATFORMS = ['linux', 'windows'];

const args = process.argv.slice(2);
const flag = args.indexOf('--platform');
const platform = flag < 0 ? undefined : args[flag + 1];
const logs = args.filter((_, i) => i !== flag && i !== flag + 1);
if (!PLATFORMS.includes(platform)) {
  console.error(`usage: shard-timings.mjs --platform ${PLATFORMS.join('|')} <log>...`);
  process.exit(1);
}

const merged = {};
for (const log of logs) {
  const times = parseSpecTimes(readFileSync(log, 'utf8'));
  if (!Object.keys(times).length) {
    console.error(`No spec times in ${log}`);
    process.exit(1);
  }
  Object.assign(merged, times);
}
if (!logs.length) {
  console.error('No logs given');
  process.exit(1);
}

let table = {};
try {
  table = JSON.parse(readFileSync(TABLE, 'utf8'));
} catch {
  // first run: no table yet
}
const column = {};
for (const key of Object.keys(merged).sort()) column[key] = Math.round(merged[key] * 10) / 10;
table[platform] = column;
const sorted = Object.fromEntries(PLATFORMS.filter((p) => p in table).map((p) => [p, table[p]]));
writeFileSync(TABLE, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`${platform}: wrote ${Object.keys(column).length} files`);
