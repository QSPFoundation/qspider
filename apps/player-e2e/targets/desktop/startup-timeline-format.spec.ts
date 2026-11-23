import { describe, expect, it } from 'vitest';
import { formatStartupTimeline } from './startup-timeline-format';

const launch = { restartBegin: 10_000, requested: 10_420, ready: 12_730 };

describe('formatStartupTimeline', () => {
  it('lists the session, the page and every start-up step relative to the request, and the longest gap', () => {
    const line = formatStartupTimeline('a scenario', launch, {
      timeOrigin: 11_520,
      domContentLoaded: 850,
      load: 900,
      marks: [
        { step: 'script', at: 12_400 },
        { step: 'init', at: 12_410 },
        { step: 'finished', at: 15_000 },
      ],
    });
    expect(line).toBe(
      'Startup timeline [a scenario]: exit 0.42s | session +2.31s | page +1.10s dom +1.95s load +2.00s' +
        ' | script +1.98s init +1.99s finished +4.58s | longest: load→finished 2.58s',
    );
  });

  it('says why the page could not be read', () => {
    const line = formatStartupTimeline('hung', launch, null, 'no answer within 5000ms');
    expect(line).toBe(
      'Startup timeline [hung]: exit 0.42s | session +2.31s | page unreadable: no answer within 5000ms',
    );
  });

  it('marks a session that never became ready', () => {
    const { ready: _, ...notReady } = launch;
    expect(formatStartupTimeline('t', notReady, null, 'x')).toBe(
      'Startup timeline [t]: exit 0.42s | session not ready | page unreadable: x',
    );
  });

  it('leaves out navigation milestones not reached yet', () => {
    const line = formatStartupTimeline('t', launch, { timeOrigin: 11_000, domContentLoaded: 0, load: 0, marks: [] });
    expect(line).toBe(
      'Startup timeline [t]: exit 0.42s | session +2.31s | page +0.58s | no start-up step reached | longest: request→page 0.58s',
    );
  });

  it('says so when the build records no start-up steps', () => {
    const line = formatStartupTimeline('t', launch, {
      timeOrigin: 11_000,
      domContentLoaded: 100,
      load: 0,
      marks: null,
    });
    expect(line).toBe(
      'Startup timeline [t]: exit 0.42s | session +2.31s | page +0.58s dom +0.68s | no start-up steps recorded' +
        ' | longest: request→page 0.58s',
    );
  });
});
