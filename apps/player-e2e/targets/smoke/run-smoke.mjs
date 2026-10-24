// Desktop launch smoke, no WebDriver:
//   node run-smoke.mjs --app <binary> [--file <game>] --expect-text <text> [--timeout-ms N] [--alive-ms M]
// Launches an E2E build of a desktop app (VITE_QSPIDER_E2E=true, `tauri build --debug`), with <game> as its
// first argument if given, and reads the markers it prints on stdout (libs/desktop/src/lib/e2e-marks.ts,
// src-tauri/src/e2e.rs). Passes (exit 0) when, within N ms of the launch, it reports in this order
//   QSPIDER_E2E_MARK startup-finished
//   QSPIDER_E2E_MARK game-running <game id>
//   QSPIDER_E2E_MARK main-text <text>      (<text>, trimmed, must equal --expect-text exactly)
// and is still running M ms after the last one. A repeat of a marker already received is ignored; a marker
// that arrives before the ones it follows fails the run. On failure (exit 1) it prints the reason, the
// markers received and the last 50 lines of the app's output. The app is then stopped by its process group.
//
// On Linux the app runs only inside the desktop E2E's private session (targets/desktop/private-env.mjs):
// started without QSPIDER_E2E_PRIVATE_SESSION, the runner re-executes itself under Xvfb and a private D-Bus,
// with a stripped env and private XDG_* dirs (a temp dir, removed afterwards); started with it, it refuses
// unless the session really is private (targets/desktop/private-session.ts). It never runs in the real session.
// Other platforms run the app directly.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { constants } from 'node:os';
import { resolve } from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline';
import { clearTimeout, setTimeout } from 'node:timers';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath, URL } from 'node:url';
import { parseArgs } from 'node:util';
import { preparePrivateEnv, PRIVATE_SESSION_WRAPPER, removePrivateDir, runTree } from '../desktop/private-env.mjs';
import { privateSessionProblem } from '../desktop/private-session.ts';

const workspaceRoot = fileURLToPath(new URL('../../../..', import.meta.url));
const MARK_PREFIX = 'QSPIDER_E2E_MARK ';
const MARKERS = ['startup-finished', 'game-running', 'main-text'];
const TAIL_LINES = 50;
/** How long the app gets to exit after TERM before its group is KILLed. */
const APP_EXIT_TIMEOUT_MS = 5_000;

const { values: options } = parseArgs({
  options: {
    app: { type: 'string' },
    file: { type: 'string' },
    'expect-text': { type: 'string' },
    'timeout-ms': { type: 'string', default: '60000' },
    'alive-ms': { type: 'string', default: '5000' },
  },
});

function usage(problem) {
  process.stderr.write(
    `${problem}\nUsage: node run-smoke.mjs --app <binary> [--file <game>] --expect-text <text> [--timeout-ms N] [--alive-ms M]\n`,
  );
  process.exit(2);
}

if (!options.app) usage('--app is required');
if (options['expect-text'] === undefined) usage('--expect-text is required');
const timeoutMs = Number(options['timeout-ms']);
const aliveMs = Number(options['alive-ms']);
if (!(timeoutMs > 0) || !(aliveMs > 0)) usage('--timeout-ms and --alive-ms must be positive numbers');

if (process.platform === 'linux' && process.env.QSPIDER_E2E_PRIVATE_SESSION !== '1') {
  // Outside the private session: build it and run this script again inside it.
  const env = { ...process.env };
  let privateDir = preparePrivateEnv(env);
  runTree([...PRIVATE_SESSION_WRAPPER, process.execPath, fileURLToPath(import.meta.url), ...process.argv.slice(2)], {
    cwd: workspaceRoot,
    env,
    cleanup: () => {
      removePrivateDir(privateDir);
      privateDir = undefined;
    },
  });
} else {
  if (process.platform === 'linux') {
    const problem = privateSessionProblem(process.env, process.getuid?.() ?? -1);
    if (problem) {
      process.stderr.write(
        `Refusing to run the smoke outside its private session: ${problem}. Run it with \`pnpm smoke:desktop\` or \`node apps/player-e2e/targets/smoke/run-smoke.mjs …\` without QSPIDER_E2E_PRIVATE_SESSION set: it builds the session itself.\n`,
      );
      process.exit(1);
    }
  }
  process.exit(await smoke());
}

/** Launches the app, checks its markers and liveness, stops it. Resolves to the exit status. */
async function smoke() {
  const app = resolve(workspaceRoot, options.app);
  const args = options.file ? [resolve(workspaceRoot, options.file)] : [];
  const expectText = options['expect-text'];
  if (!existsSync(app)) {
    process.stderr.write(`FAIL: app binary not found: ${app} (build it first)\n`);
    return 1;
  }
  log(`launching ${[app, ...args].join(' ')}`);
  log(`expecting main-text "${expectText}" within ${timeoutMs}ms, then ${aliveMs}ms alive`);

  const ownGroup = process.platform !== 'win32';
  const started = Date.now();
  const child = spawn(app, args, {
    cwd: workspaceRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    // Its own process group, so stopping it reaches the app's helper processes (e.g. WebKit's) too.
    detached: ownGroup,
  });

  const tail = [];
  const received = []; // every marker line, in arrival order
  let next = 0; // index in MARKERS of the marker awaited
  let settle;
  const outcome = new Promise((done) => {
    settle = (failure) => {
      settle = () => undefined;
      done(failure);
    };
  });
  const fail = (reason) => settle(reason);

  const remember = (line) => {
    tail.push(line);
    if (tail.length > TAIL_LINES) tail.shift();
  };
  const stdout = createInterface({ input: child.stdout });
  const stderr = createInterface({ input: child.stderr });
  stdout.on('line', (line) => {
    remember(line);
    if (line.startsWith(MARK_PREFIX)) onMarker(line);
  });
  stderr.on('line', remember);

  let timeout = setTimeout(() => fail(`timeout waiting for ${MARKERS[next]}`), timeoutMs);
  let liveness;

  function onMarker(line) {
    const rest = line.slice(MARK_PREFIX.length);
    const space = rest.indexOf(' ');
    const marker = space === -1 ? rest : rest.slice(0, space);
    const detail = space === -1 ? '' : rest.slice(space + 1).trim();
    const index = MARKERS.indexOf(marker);
    log(`+${Date.now() - started}ms ${line}`);
    received.push(line);
    if (index === -1) return; // not one this smoke checks
    if (index < next) {
      log(`  (repeat of ${marker}, ignored)`);
      return;
    }
    if (index > next) {
      fail(`markers out of order: got ${marker} while waiting for ${MARKERS[next]}`);
      return;
    }
    next++;
    if (marker === 'game-running' && !detail) {
      fail('game-running carried no game id');
      return;
    }
    if (marker === 'main-text') {
      if (detail !== expectText) {
        fail(`main-text was "${detail}", expected "${expectText}"`);
        return;
      }
      clearTimeout(timeout);
      timeout = undefined;
      // The liveness window: an observation period, not a synchronisation sleep. Everything awaited has
      // already arrived; the app must simply not exit (crash) during these M ms after its first screen.
      liveness = setTimeout(() => settle(undefined), aliveMs);
    }
  }

  child.on('error', (error) => fail(`could not start the app: ${error.message}`));
  child.on('exit', (code, signal) => {
    // Read what the app wrote before it exited, so its last markers are not lost (bounded: helper
    // processes may keep the pipe open).
    const drained = new Promise((done) => stdout.once('close', done));
    Promise.race([drained, delay(1_000)]).then(() => {
      const how = signal ? `signal ${signal}` : `code ${code}`;
      fail(
        next < MARKERS.length
          ? `app exited (${how}) before ${MARKERS[next]}`
          : `app exited (${how}) during the liveness window`,
      );
    });
  });

  // A signal to the runner stops the app first.
  for (const name of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(name, () => {
      stopApp().finally(() => process.exit(128 + (constants.signals[name] ?? 0)));
    });
  }

  const failure = await outcome;
  clearTimeout(timeout);
  clearTimeout(liveness);
  await stopApp();

  const elapsed = Date.now() - started;
  if (!failure) {
    log(`PASS in ${elapsed}ms: ${MARKERS.length} markers in order, main-text "${expectText}", alive ${aliveMs}ms`);
    return 0;
  }
  const out = [`FAIL after ${elapsed}ms: ${failure}`, 'Markers received:'];
  out.push(...(received.length ? received.map((line) => `  ${line}`) : ['  (none)']));
  out.push(`Last ${tail.length} output lines:`, ...tail.map((line) => `  | ${line}`));
  process.stderr.write(`${out.join('\n')}\n`);
  return 1;

  /** Stops the app's process group (by its PID): TERM, then KILL if it is still there after a while. */
  async function stopApp() {
    if (!ownGroup) {
      if (child.exitCode === null && child.signalCode === null) child.kill();
      return;
    }
    const alive = () => {
      try {
        process.kill(-child.pid, 0);
        return true;
      } catch {
        return false;
      }
    };
    if (!child.pid || !alive()) return;
    process.kill(-child.pid, 'SIGTERM');
    const deadline = Date.now() + APP_EXIT_TIMEOUT_MS;
    while (alive() && Date.now() < deadline) await delay(100);
    if (alive()) process.kill(-child.pid, 'SIGKILL');
  }
}

function log(message) {
  process.stdout.write(`[smoke] ${message}\n`);
}
