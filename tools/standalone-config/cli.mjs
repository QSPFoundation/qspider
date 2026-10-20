#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { convertFromV1, generateTauriConfig, validate } from './generate.mjs';

const MIGRATE_URL =
  'https://github.com/QSPFoundation/qspider-standalone-game-template#migrating-an-existing-game-repo-tauri-2';

function fail(...lines) {
  for (const l of lines) console.error(l);
  process.exit(1);
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    return fail(`Cannot read ${file}: ${e.message}`);
  }
}

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const out = outIdx >= 0 ? args[outIdx + 1] : undefined;
if (outIdx >= 0 && !out) fail('--out requires a file path');
const v1Idx = args.indexOf('--from-v1');
const v1File = v1Idx >= 0 ? args[v1Idx + 1] : undefined;
if (v1Idx >= 0 && !v1File) fail('--from-v1 requires a file path');

if (v1File) {
  const { config, dropped, warnings } = convertFromV1(readJson(v1File));
  console.log(JSON.stringify(config, null, 2));
  for (const w of warnings) console.error(`warning: ${w}`);
  if (dropped.length > 0) {
    console.error('The following v1 settings have no equivalent and were dropped:');
    for (const d of dropped) console.error(`  - ${d}`);
  }
} else {
  const input = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--out');
  if (!input || !out)
    fail(
      'Usage: standalone:config <qspider.desktop.json> --out <file>',
      '       standalone:config --from-v1 <game.build.conf.json>',
    );
  if (!existsSync(input)) {
    if (existsSync(join(dirname(input), 'game.build.conf.json'))) {
      fail(`Found old game.build.conf.json. Migrate it: see ${MIGRATE_URL}`);
    }
    fail(`${basename(input)} not found`);
  }
  const cfg = readJson(input);
  const errors = validate(cfg);
  if (errors.length > 0) fail(`Invalid ${input}:`, ...errors.map((e) => `  - ${e}`));
  const { config, warnings } = generateTauriConfig(cfg);
  for (const w of warnings) console.error(`warning: ${w}`);
  writeFileSync(out, JSON.stringify(config, null, 2) + '\n');
}
