// Prints where each app launch spent its time (formatStartupTimeline), to root-cause slow and hung
// start-ups on Windows CI: the runner's restart times plus the page's navigation and resource timing and the app's
// own start-up steps (libs/desktop markStartup, E2E builds only), read over WebDriver.
import { browser } from '@wdio/globals';
import { formatStartupTimeline, type LaunchTimes, type PageTimes } from './startup-timeline-format';

/** How long reading the page may take: a hung webview may never answer. */
const READ_TIMEOUT = 5_000;

/** The launch whose timeline has not been printed yet. */
let pending: LaunchTimes | undefined;

/** fresh-app.ts: a restart that began at `restartBegin` now asks for the new app's session. */
export function launchRequested(restartBegin: number): void {
  pending = { restartBegin, requested: Date.now() };
}

/** fresh-app.ts: the new app's session is ready. */
export function launchReady(): void {
  if (pending) pending.ready = Date.now();
}

function readPage(): Promise<PageTimes> {
  return browser.execute(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const marks = (window as unknown as { __qspiderStartup?: { step: string; at: number }[] }).__qspiderStartup;
    return {
      timeOrigin: performance.timeOrigin,
      html: nav?.responseEnd ?? 0,
      domContentLoaded: nav?.domContentLoadedEventEnd ?? 0,
      load: nav?.loadEventEnd ?? 0,
      marks: marks ?? null,
      files: (performance.getEntriesByType('resource') as PerformanceResourceTiming[]).map((entry) => ({
        name: entry.name,
        start: entry.fetchStart,
        end: entry.responseEnd,
      })),
    };
  });
}

/**
 * Prints the timeline of the last launch, once: after each scenario (wdio.conf.ts afterTest) and before a restart
 * inside a scenario closes the app. Never throws: a page that does not answer is part of the line.
 */
export async function reportStartupTimeline(title: string): Promise<void> {
  const launch = pending;
  if (!launch) return;
  pending = undefined;
  let page: PageTimes | null = null;
  let problem: string | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    page = await Promise.race([
      readPage(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`no answer within ${READ_TIMEOUT}ms`)), READ_TIMEOUT);
      }),
    ]);
  } catch (error) {
    problem = error instanceof Error ? error.message.split('\n')[0] : String(error);
  } finally {
    clearTimeout(timer);
  }
  console.log(formatStartupTimeline(title, launch, page, problem));
}
