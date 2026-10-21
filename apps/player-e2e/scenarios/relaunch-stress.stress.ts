// TEMPORARY: relaunch stress repro (chore: desktop relaunch repro + diagnostics).
import { browser, $ } from '@wdio/globals';
import { readdirSync, readFileSync } from 'node:fs';
import { pickFileInNativeDialog } from '../targets/desktop/native-dialog';
import { E2E_GAME } from '../fixtures/e2e-game';
import { restartAppWithEmptyData } from '../targets/desktop/fresh-app';

const N = Number(process.env['STRESS_N'] ?? 20);
const WAIT = 8_000;
const MODE = process.env['STRESS_MODE'] ?? 'A'; // A relaunch only; B = open a game via native AT-SPI dialog each iteration

describe('relaunch stress', function () {
  this.timeout(N * 30_000);
  it('relaunches reach the startup marker', async () => {
    let hangs = 0;
    for (let i = 1; i <= N; i++) {
      const t0 = Date.now();
      await restartAppWithEmptyData();
      const tRestart = Date.now() - t0;
      let ok = true;
      try {
        await $('[data-qa="startup-finished"]').waitForExist({ timeout: WAIT });
      } catch {
        ok = false;
      }
      const dt = Date.now() - t0;
      if (ok && MODE === 'B') {
        await $('[data-qa="open-game"]').waitForClickable({ timeout: 5000 });
        await $('[data-qa="open-game"]').click();
        await pickFileInNativeDialog(E2E_GAME.path);
        await browser.pause(1500);
      }
      if (ok) {
        console.log(`STRESS iter ${i}: PASS restart=${tRestart}ms total=${dt}ms`);
        continue;
      }
      hangs++;
      let diag = '';
      try {
        diag = JSON.stringify(
          await browser.execute(() => ({
            readyState: document.readyState,
            url: location.href,
            title: document.title,
            bodyLen: document.body?.innerHTML.length,
            body: document.body?.innerHTML.slice(0, 600),
            trace: (window as unknown as { __initTrace?: unknown }).__initTrace,
            hasTauri: '__TAURI_INTERNALS__' in window,
          })),
        );
      } catch (e) {
        diag = 'execute failed: ' + String(e);
      }
      const dataDirs = JSON.parse(process.env['QSPIDER_E2E_APP_DATA_DIRS']!) as string[];
      const dirs = dataDirs.map((d) => {
        const walk = (p: string, depth: number): string[] =>
          depth > 4
            ? []
            : readdirSync(p, { withFileTypes: true }).flatMap((e) => [
                p + '/' + e.name,
                ...(e.isDirectory() ? walk(p + '/' + e.name, depth + 1) : []),
              ]);
        try {
          return walk(d, 0).map((x) => x.replace(d, '~'));
        } catch {
          return [];
        }
      });
      const procs = readdirSync('/proc')
        .filter((n) => /^\d+$/.test(n))
        .flatMap((n) => {
          try {
            return [n + ':' + readFileSync(`/proc/${n}/comm`, 'utf8').trim()];
          } catch {
            return [];
          }
        })
        .filter((s) => /qspider|WebKit/.test(s));
      const py = readdirSync('/proc')
        .filter((n) => /^\d+$/.test(n))
        .flatMap((n) => {
          try {
            return [n + ':' + readFileSync(`/proc/${n}/cmdline`, 'utf8').replace(/\0/g, ' ').slice(0, 80)];
          } catch {
            return [];
          }
        })
        .filter((s) => /dialog\.py|atspi|at-spi/.test(s));
      console.log(`STRESS iter ${i}: ATSPI procs=${py.join(' ; ')}`);
      console.log(
        `STRESS iter ${i}: HANG restart=${tRestart}ms diag=${diag}\n  procs=${procs.join(',')}\n  dirs=${JSON.stringify(dirs)}`,
      );
    }
    console.log(`STRESS summary: ${hangs}/${N} hangs`);
  });
});
