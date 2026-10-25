// Runs the desktop E2E (WebdriverIO + tauri-driver): `node run-desktop-e2e.mjs [--standalone] [--shard i/n] [wdio args...]`.
// On Linux the run is always headless and isolated from the developer's desktop session and home:
//   xvfb-run -a -s '-screen 0 1280x1024x24'
//                                    a virtual X display of a fixed size; everything below sees only its DISPLAY
//   └ private environment            fresh private dir (0700) as XDG_RUNTIME_DIR, with XDG_CONFIG/DATA/CACHE/
//                                    STATE_HOME under it; GSETTINGS_BACKEND=memory; no variable that points
//                                    at the desktop session (Wayland, D-Bus, AT-SPI, XDG_SESSION_*, audio,
//                                    ssh agent, GTK_MODULES, Hyprland) and no host display scaling or look
//                                    (GDK_SCALE, GDK_DPI_SCALE, QT_*, GTK_THEME, XCURSOR_SIZE); GDK_BACKEND=x11;
//                                    gvfs kept local (no FUSE mounts); QSPIDER_E2E_PRIVATE_SESSION=1
//     └ dbus-run-session --          a private session bus
//       └ atspi/with-a11y-bus.sh     the AT-SPI accessibility bus + registry (the native file dialog
//                                    is driven through AT-SPI); refuses to run outside this tree
//         └ wdio run …/wdio.conf.ts  (wdio.standalone.conf.ts with --standalone; sets its own per-run
//                                    XDG_* dirs for tauri-driver and the app)
// Other platforms run wdio directly. The private session and the process-tree handling are in private-env.mjs.
import console from 'node:console';
import { readFileSync } from 'node:fs';
import { delimiter, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { preparePrivateEnv, PRIVATE_SESSION_WRAPPER, removePrivateDir, runTree } from './private-env.mjs';
import { assignShards, FILE_OVERHEAD_S, mainSpecFiles, parseShard } from './shards.ts';

const workspaceRoot = fileURLToPath(new URL('../../../..', import.meta.url));
const a11yBus = fileURLToPath(new URL('./atspi/with-a11y-bus.sh', import.meta.url));
// `--standalone` (anywhere in the arguments) runs the standalone target's config (wdio.standalone.conf.ts)
// instead; the flag is not passed on to wdio.
const standalone = process.argv.slice(2).includes('--standalone');
const wdioArgs = [];
// `--shard i/n` (or `--shard=i/n`) is not passed on to wdio: the runner deals the main suite's spec files out
// by measured time (shards.ts, shard-timings.json) and passes only this shard's files as `--spec`.
let shardArg;
const rest = process.argv.slice(2).filter((arg) => arg !== '--standalone');
for (let i = 0; i < rest.length; i++) {
  const arg = rest[i];
  if (arg === '--shard') shardArg = rest[++i] ?? '';
  else if (arg.startsWith('--shard=')) shardArg = arg.slice('--shard='.length);
  else wdioArgs.push(arg);
}
if (shardArg !== undefined) {
  const refuse = (message) => {
    console.error(`run-desktop-e2e: ${message}`);
    process.exit(2);
  };
  if (standalone) refuse('--shard splits the main suite and cannot be combined with --standalone');
  if (wdioArgs.some((arg) => arg === '--spec' || arg.startsWith('--spec='))) {
    refuse('--shard picks the spec files itself and cannot be combined with --spec');
  }
  let shard;
  try {
    shard = parseShard(shardArg);
  } catch (error) {
    refuse(error.message);
  }
  const platform = process.platform === 'win32' ? 'windows' : 'linux';
  const timings = JSON.parse(readFileSync(new URL('./shard-timings.json', import.meta.url), 'utf8'))[platform] ?? {};
  const files = assignShards(mainSpecFiles(fileURLToPath(new URL('.', import.meta.url))), timings, shard.total)[
    shard.current - 1
  ];
  const label = `Shard ${shardArg}`;
  if (!files.length) {
    console.log(`${label}: no spec files, nothing to run`);
    process.exit(0);
  }
  const seconds = files.reduce((sum, f) => sum + (timings[f] ?? 0) + FILE_OVERHEAD_S, 0);
  console.log(`${label}: ${files.length} spec files (~${Math.round(seconds)} s): ${files.join(', ')}`);
  for (const f of files) wdioArgs.push('--spec', `apps/player-e2e/scenarios/${f}`);
}
const wdioConfig = `apps/player-e2e/targets/desktop/${standalone ? 'wdio.standalone.conf.ts' : 'wdio.conf.ts'}`;
const wdio = ['wdio', 'run', wdioConfig, ...wdioArgs];

const env = { ...process.env };
// Find the workspace's wdio even when not started through a pnpm script.
env.PATH = [join(workspaceRoot, 'node_modules/.bin'), env.PATH].join(delimiter);
// The standalone run keeps its artifacts apart, the AT-SPI daemon log included.
if (standalone && !env.QSPIDER_A11Y_LOG) {
  env.QSPIDER_A11Y_LOG = join(workspaceRoot, 'apps/player-e2e/artifacts/desktop-standalone/a11y-bus.log');
}

let command = wdio;
let privateDir;

// Anything here that throws (the private dir, the symlinks, the python probe) leaves no private dir behind.
if (process.platform === 'linux') {
  privateDir = preparePrivateEnv(env);
  command = [...PRIVATE_SESSION_WRAPPER, a11yBus, ...wdio];
}

runTree(command, {
  cwd: workspaceRoot,
  env,
  // wdio is a .cmd shim on Windows.
  shell: process.platform === 'win32',
  cleanup: () => {
    removePrivateDir(privateDir);
    privateDir = undefined;
  },
});
