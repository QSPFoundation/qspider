// TEMPORARY (3c round 10 diagnosis): prints facts about the Windows failures to the job log. Never fails on
// purpose; every probe is caught and logged. Removed after the diagnosis.
import { execFileSync } from 'node:child_process';
import { win32 } from 'node:path';
import { actorCalled, engage } from '@serenity-js/core';
import { browser } from '@wdio/globals';
import { GAME_HTML } from '../fixtures/game-html-game';
import { RESOURCES_GAME } from '../fixtures/resources-game';
import { SAVES_GAME } from '../fixtures/saves-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeMainTextContaining } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { SaveToSlot } from '../screenplay/saves/tasks';
import { OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { desktopCast } from '../targets/desktop/cast';
import {
  restartAppKeepingData,
  restartAppKeepingDataWith,
  restartAppWithEmptyData,
} from '../targets/desktop/fresh-app';

const log = (label: string, value: unknown): void => {
  console.log(`[DIAG] ${label}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);
};

async function probe(label: string, fn: () => Promise<unknown>): Promise<void> {
  try {
    log(label, await fn());
  } catch (error) {
    log(`${label} FAILED`, String(error).slice(0, 600));
  }
}

/** --user-data-dir of every msedgewebview2 browser process, and the app's command line. */
function webviewProcesses(): unknown {
  const out = execFileSync(
    'powershell',
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      "Get-CimInstance Win32_Process -Filter \"Name='msedgewebview2.exe' or Name='qspider.exe'\" | Select-Object ProcessId,ParentProcessId,Name,CommandLine | ConvertTo-Json -Compress",
    ],
    { encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 },
  );
  const parsed = JSON.parse(out || '[]') as { ProcessId: number; Name: string; CommandLine: string | null }[];
  return (Array.isArray(parsed) ? parsed : [parsed])
    .filter((p) => p.Name === 'qspider.exe' || !/--type=/.test(p.CommandLine ?? ''))
    .map((p) => ({
      pid: p.ProcessId,
      name: p.Name,
      userDataDir: /--user-data-dir=("[^"]*"|\S+)/.exec(p.CommandLine ?? '')?.[1],
      cmd: p.Name === 'qspider.exe' ? p.CommandLine : (p.CommandLine ?? '').slice(0, 400),
    }));
}

const waitStartup = () => browser.$('[data-qa="startup-finished"]').waitForExist({ timeout: 30_000, interval: 100 });

const pageState = () =>
  browser.execute(() => ({
    href: location.href,
    sinceNavigationMs: Math.round(performance.now()),
    keys: Object.keys(localStorage),
    theme: localStorage.getItem('qspider-theme'),
    lng: localStorage.getItem('i18nextLng'),
    diag: localStorage.getItem('qspider-diag'),
    toast: document.querySelector('[data-qa="notice-toast"]')?.textContent ?? null,
  }));

/** Polls for the launch toast right after a restart: when it is first seen, relative to the page's start. */
async function toastTiming(): Promise<unknown> {
  const first = await browser.execute(() => Math.round(performance.now()));
  const deadline = Date.now() + 6000;
  while (Date.now() < deadline) {
    const seen = await browser.execute(() => ({
      t: Math.round(performance.now()),
      toast: document.querySelector('[data-qa="notice-toast"]')?.textContent ?? null,
    }));
    if (seen.toast) return { firstCommandAtMs: first, ...seen };
  }
  return { firstCommandAtMs: first, toast: 'never seen within 6 s' };
}

const geometry = (selectors: string[]) =>
  browser.execute((sels: string[]) => {
    const se = document.scrollingElement;
    return {
      innerHeight: window.innerHeight,
      scrollingElementTop: se?.scrollTop,
      scrollingElementHeight: se?.scrollHeight,
      bodyOverflow: getComputedStyle(document.body).overflow,
      bodyHeight: document.body.getBoundingClientRect().height,
      active: document.activeElement?.outerHTML.slice(0, 120),
      elements: sels.map((s) => {
        const el = document.querySelector(s);
        if (!el) return { s, missing: true };
        const r = el.getBoundingClientRect();
        return {
          s,
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          height: Math.round(r.height),
          text: (el.textContent ?? '').slice(0, 60),
          scrollTop: (el as HTMLElement).scrollTop,
          scrollHeight: (el as HTMLElement).scrollHeight,
          clientHeight: (el as HTMLElement).clientHeight,
        };
      }),
    };
  }, selectors);

const webdriverText = async (selector: string) => ({
  selector,
  getText: await browser.$(selector).getText(),
  displayed: await browser.$(selector).isDisplayed(),
});

const ACTIONS_VIEWPORT = '[data-qsp="actions"] [data-radix-scroll-area-viewport]';

describe('windows diagnosis', () => {
  it('B/C/D: markers, document scroll, actions overflow, external fetch, image map', async function () {
    this.timeout(400_000);
    await restartAppWithEmptyData();
    engage(desktopCast());
    const player = actorCalled('Player');

    // Group B + sound: the resources game's script markers and the document scroll.
    await probe('resources: open', () =>
      player.attemptsTo(
        StartPlayer(),
        SeeStartupFinished(),
        OpenGameFile(RESOURCES_GAME.zipPath),
        SeeGameStarted(RESOURCES_GAME.text.start),
      ),
    );
    const marks = ['[data-qa="res-start-seen"]', '[data-qsp="main-content"]', '[data-qsp="player"]'];
    await probe('resources: geometry at start', () => geometry(marks));
    await probe('resources: webdriver text of marker', () => webdriverText('[data-qa="res-start-seen"]'));
    await probe('resources: to sound', () =>
      player.attemptsTo(
        ClickAction(RESOURCES_GAME.actions.start.toSound),
        SeeMainTextContaining(RESOURCES_GAME.text.soundReady),
      ),
    );
    await probe('resources: geometry after To sound', () => geometry([...marks, ACTIONS_VIEWPORT]));
    await probe('resources: click Play (native)', async () => {
      await browser.$('//button[@data-qsp="action"][normalize-space()="Play"]').click();
      return 'clicked';
    });
    await probe('resources: geometry after Play click', () => geometry([...marks, ACTIONS_VIEWPORT]));

    // Group D: an absolute http URL fetched by the page (Howler's Web Audio path, a game script's XHR).
    await probe('ext: page context', () =>
      browser.execute(() => ({ origin: location.origin, secure: window.isSecureContext, base: document.baseURI })),
    );
    await probe('ext: fetch ext.wav', () =>
      browser.executeAsync((done: (v: unknown) => void) => {
        fetch('http://127.0.0.1:47631/ext.wav')
          .then((r) => done({ ok: r.ok, status: r.status, type: r.type }))
          .catch((e: unknown) => done({ error: String(e) }));
      }),
    );
    await probe('ext: xhr ext.txt', () =>
      browser.executeAsync((done: (v: unknown) => void) => {
        const x = new XMLHttpRequest();
        x.open('GET', 'http://127.0.0.1:47631/ext.txt');
        x.onload = () => done({ status: x.status, text: x.responseText });
        x.onerror = () => done({ error: 'xhr error', status: x.status });
        x.send();
      }),
    );
    await probe('ext: fetch 127.0.0.1 with targetAddressSpace', () =>
      browser.executeAsync((done: (v: unknown) => void) => {
        fetch('http://127.0.0.1:47631/ext.txt', { targetAddressSpace: 'loopback' } as RequestInit)
          .then((r) => r.text().then((t) => done({ status: r.status, t })))
          .catch((e: unknown) => done({ error: String(e) }));
      }),
    );
    await probe('ext: fetch http://localhost', () =>
      browser.executeAsync((done: (v: unknown) => void) => {
        fetch('http://localhost:47631/ext.txt')
          .then((r) => r.text().then((t) => done({ status: r.status, t })))
          .catch((e: unknown) => done({ error: String(e) }));
      }),
    );
    await probe('ext: permission local-network-access', () =>
      browser.executeAsync((done: (v: unknown) => void) => {
        navigator.permissions
          .query({ name: 'local-network-access' as PermissionName })
          .then((s) => done(s.state))
          .catch((e: unknown) => done(String(e)));
      }),
    );

    // Group C (saves): the room's eight actions in the actions panel; what scrolls it.
    await probe('saves: restart', async () => {
      await restartAppWithEmptyData();
      engage(desktopCast());
      return 'ok';
    });
    const saves = actorCalled('Player');
    await probe('saves: open + room', () =>
      saves.attemptsTo(
        StartPlayer(),
        SeeStartupFinished(),
        OpenGameFile(SAVES_GAME.path),
        SeeGameStarted(SAVES_GAME.text.start),
        ClickAction(SAVES_GAME.action.goToRoom),
        SeeMainTextContaining(SAVES_GAME.text.counter(0)),
      ),
    );
    const actionsGeometry = () =>
      browser.execute((sel: string) => {
        const vp = document.querySelector(sel) as HTMLElement | null;
        const items = Array.from(document.querySelectorAll('[data-qsp="action"]')).map((b) => {
          const r = b.getBoundingClientRect();
          return `${(b.textContent ?? '').trim()}@${Math.round(r.top)}+${Math.round(r.height)}`;
        });
        const font = getComputedStyle(document.querySelector('[data-qsp="action"]')!);
        return {
          viewport: vp && { scrollTop: vp.scrollTop, scrollHeight: vp.scrollHeight, clientHeight: vp.clientHeight },
          font: `${font.fontFamily} ${font.fontSize} lh=${font.lineHeight}`,
          items,
          active: (document.activeElement?.textContent ?? '').slice(0, 40),
        };
      }, ACTIONS_VIEWPORT);
    await probe('saves: actions at room', actionsGeometry);
    await probe('saves: Increment', () =>
      saves.attemptsTo(ClickAction(SAVES_GAME.action.increment), SeeMainTextContaining(SAVES_GAME.text.counter(1))),
    );
    await probe('saves: actions after Increment', actionsGeometry);
    await probe('saves: click Save', () => saves.attemptsTo(ClickAction(SAVES_GAME.action.save)));
    await probe('saves: actions with the save panel open', actionsGeometry);
    await probe('saves: SaveToSlot(1)', () => saves.attemptsTo(SaveToSlot(1)));
    await probe('saves: actions after the save panel closed', actionsGeometry);

    // Group D: the image map.
    await probe('game-html: restart', async () => {
      await restartAppWithEmptyData();
      engage(desktopCast());
      return 'ok';
    });
    const html = actorCalled('Player');
    await probe('game-html: open + links', () =>
      html.attemptsTo(
        StartPlayer(),
        SeeStartupFinished(),
        OpenGameFile(GAME_HTML.path),
        SeeGameStarted(GAME_HTML.text.start),
        ClickAction(GAME_HTML.actions.links),
      ),
    );
    await probe('game-html: click <area> element', async () => {
      await browser.$(`[data-qa="${GAME_HTML.marks.areaLink}"]`).click();
      await browser.pause(1000);
      return browser.$('[data-qsp="main-content"]').getText();
    });
    await probe('game-html: pointer action on the image', async () => {
      await browser.$(`[data-qa="${GAME_HTML.marks.areaImage}"]`).click({ x: 0, y: 0 });
      await browser.pause(1000);
      return browser.$('[data-qsp="main-content"]').getText();
    });
  });

  it('A: web storage across a restart, the launch toast timing, a fixed user data dir', async function () {
    this.timeout(300_000);
    await restartAppWithEmptyData();
    await waitStartup();
    await probe('A1 processes', async () => webviewProcesses());
    await probe('A1 page', pageState);
    await probe('A1 set', () => browser.execute(() => localStorage.setItem('qspider-diag', 'kept')));
    await restartAppKeepingData();
    await probe('A2 toast timing after restart', toastTiming);
    await waitStartup();
    await probe('A2 processes after restart', async () => webviewProcesses());
    await probe('A2 page after restart', pageState);

    const dir = win32.join(process.env['LOCALAPPDATA'] ?? 'C:\\', 'org.qsp.qspider', 'e2e-webview2');
    await probe('A3 relaunch with --user-data-dir', async () => {
      await restartAppKeepingDataWith([`--user-data-dir=${dir}`]);
      await waitStartup();
      await browser.execute(() => localStorage.setItem('qspider-diag', 'fixed-dir'));
      return { processes: webviewProcesses(), page: await pageState() };
    });
    await probe('A4 relaunch again with the same --user-data-dir', async () => {
      await restartAppKeepingDataWith([`--user-data-dir=${dir}`]);
      await waitStartup();
      return { processes: webviewProcesses(), page: await pageState() };
    });
  });
});
