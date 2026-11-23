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
  /** Navigation timing, ms after timeOrigin; 0 while not reached. */
  domContentLoaded: number;
  load: number;
  /** The app's own start-up steps (libs/desktop markStartup); null when the build records none. */
  marks: { step: string; at: number }[] | null;
}

const seconds = (ms: number): string => `${(ms / 1000).toFixed(2)}s`;
const since = (from: number, at: number): string => `+${seconds(at - from)}`;

/**
 * `Startup timeline [title]: exit 0.42s | session +2.31s | page +1.10s dom +1.95s load +2.02s | script +1.98s …
 * | longest: page→dom 0.85s`. Times after `exit` are relative to the moment the new session was requested;
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
  if (page.domContentLoaded > 0) events.push(['dom', page.timeOrigin + page.domContentLoaded]);
  if (page.load > 0) events.push(['load', page.timeOrigin + page.load]);
  parts.push(
    events
      .slice(1)
      .map(([name, at]) => `${name} ${since(t0, at)}`)
      .join(' '),
  );

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
