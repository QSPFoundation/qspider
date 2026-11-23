// The one-line start-up timeline the desktop runner prints for every app launch (startup-timeline.ts).
// Pure, so it is unit tested; all times are wall-clock ms (Date.now()) on the machine that runs both.

/** When the runner restarted the app: began the restart, asked for the new session, and got it. */
export interface LaunchTimes {
  restartBegin: number;
  requested: number;
  ready?: number;
}

/** What the page reports about itself (startup-timeline.ts reads it over WebDriver). */
export interface PageTimes {
  /** performance.timeOrigin: when the webview started navigating to the app. */
  timeOrigin: number;
  /**
   * Navigation timing of the HTML request, ms after timeOrigin; 0 while not reached (or not reported). `fetch`: the
   * webview is ready to fetch it; `sent`: the request goes out; `firstByte`: the app's answer begins; `html`: it ends.
   */
  fetch: number;
  sent: number;
  firstByte: number;
  html: number;
  domContentLoaded: number;
  load: number;
  /** The app's own start-up steps (libs/desktop markStartup); null when the build records none. */
  marks: { step: string; at: number }[] | null;
  /** Resource timing of every file the page fetched: `start`/`end` are fetchStart/responseEnd, ms after timeOrigin. */
  files: { name: string; start: number; end: number }[];
}

const seconds = (ms: number): string => `${(ms / 1000).toFixed(2)}s`;
const since = (from: number, at: number): string => `+${seconds(at - from)}`;
const baseName = (url: string): string => url.split(/[?#]/)[0].split('/').pop() || url;

/**
 * The files fetched before the app's code first ran (all of them while it never ran): how many, when the last
 * one was served (`files` event) and the one that took longest to serve. Tells serving the app from running it.
 */
function describeFiles(t0: number, page: PageTimes, firstMark: number | undefined): { text: string; served?: number } {
  const files = page.files.filter((file) => firstMark === undefined || page.timeOrigin + file.start <= firstMark);
  if (!files.length) return { text: 'no files timed' };
  const at = (ms: number): number => page.timeOrigin + ms;
  const served = at(Math.max(...files.map((file) => file.end)));
  const slowest = files.reduce((a, b) => (b.end - b.start > a.end - a.start ? b : a));
  return {
    text:
      `files ${files.length} served ${since(t0, served)},` +
      ` slowest ${baseName(slowest.name)} ${since(t0, at(slowest.start))}→${since(t0, at(slowest.end))}`,
    served,
  };
}

/**
 * `Startup timeline [title]: exit 0.42s | session +2.31s | page +1.10s fetch +1.10s sent +1.11s first-byte +1.11s
 * html +1.12s dom +1.95s load +2.02s
 * | files 3 served +1.70s, slowest index.js +1.15s→+1.70s | script +1.98s … | longest: files→script 0.28s`.
 * Times after `exit` are relative to the moment the new session was requested;
 * `exit` is how long the previous app took to go before that. Without page times, `problem` says why.
 */
export function formatStartupTimeline(
  title: string,
  launch: LaunchTimes,
  page: PageTimes | null,
  problem?: string,
): string {
  const t0 = launch.requested;
  const parts = [`exit ${seconds(launch.requested - launch.restartBegin)}`];
  parts.push(launch.ready === undefined ? 'session not ready' : `session ${since(t0, launch.ready)}`);
  if (!page) {
    parts.push(`page unreadable: ${problem ?? 'unknown'}`);
    return `Startup timeline [${title}]: ${parts.join(' | ')}`;
  }

  const events: [string, number][] = [
    ['request', t0],
    ['page', page.timeOrigin],
  ];
  const request: [string, number][] = [
    ['fetch', page.fetch],
    ['sent', page.sent],
    ['first-byte', page.firstByte],
    ['html', page.html],
  ];
  for (const [name, ms] of request) if (ms > 0) events.push([name, page.timeOrigin + ms]);
  if (page.domContentLoaded > 0) events.push(['dom', page.timeOrigin + page.domContentLoaded]);
  if (page.load > 0) events.push(['load', page.timeOrigin + page.load]);
  parts.push(
    events
      .slice(1)
      .map(([name, at]) => `${name} ${since(t0, at)}`)
      .join(' '),
  );

  const files = describeFiles(t0, page, page.marks?.[0]?.at);
  parts.push(files.text);
  if (files.served !== undefined) events.push(['files', files.served]);

  if (page.marks === null) {
    parts.push('no start-up steps recorded');
  } else {
    const steps = page.marks.map(({ step, at }): [string, number] => [step, at]);
    parts.push(
      steps.length ? steps.map(([step, at]) => `${step} ${since(t0, at)}`).join(' ') : 'no start-up step reached',
    );
    events.push(...steps);
  }

  const ordered = [...events].sort((a, b) => a[1] - b[1]);
  let longest: [string, string, number] | undefined;
  for (let i = 1; i < ordered.length; i++) {
    const gap = ordered[i][1] - ordered[i - 1][1];
    if (!longest || gap > longest[2]) longest = [ordered[i - 1][0], ordered[i][0], gap];
  }
  if (longest) parts.push(`longest: ${longest[0]}→${longest[1]} ${seconds(longest[2])}`);
  return `Startup timeline [${title}]: ${parts.join(' | ')}`;
}
