import { describe, expect, it } from 'vitest';
import { formatStartupTimeline } from './startup-timeline-format';

const launch = { restartBegin: 10_000, requested: 10_420, ready: 12_730 };

describe('formatStartupTimeline', () => {
  it('lists the session, the page and every start-up step relative to the request, and the longest gap', () => {
    const line = formatStartupTimeline('a scenario', launch, {
      timeOrigin: 11_520,
      html: 20,
      domContentLoaded: 850,
      load: 900,
      files: [
        { name: 'http://tauri.localhost/assets/index-abc.js?v=1', start: 30, end: 700 },
        { name: 'http://tauri.localhost/assets/index.css', start: 30, end: 60 },
        { name: 'http://tauri.localhost/assets/lazy.js', start: 3_000, end: 3_100 },
      ],
      marks: [
        { step: 'script', at: 12_400 },
        { step: 'init', at: 12_410 },
        { step: 'finished', at: 15_000 },
      ],
    });
    expect(line).toBe(
      'Startup timeline [a scenario]: exit 0.42s | session +2.31s | page +1.10s html +1.12s dom +1.95s load +2.00s' +
        ' | files 2 served +1.80s, slowest index-abc.js +1.13s→+1.80s' +
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
    const line = formatStartupTimeline('t', launch, {
      timeOrigin: 11_000,
      html: 0,
      domContentLoaded: 0,
      load: 0,
      marks: [],
      files: [],
    });
    expect(line).toBe(
      'Startup timeline [t]: exit 0.42s | session +2.31s | page +0.58s | no files timed | no start-up step reached' +
        ' | longest: request→page 0.58s',
    );
  });

  it('says so when the build records no start-up steps', () => {
    const line = formatStartupTimeline('t', launch, {
      timeOrigin: 11_000,
      html: 0,
      domContentLoaded: 100,
      load: 0,
      marks: null,
      files: [],
    });
    expect(line).toBe(
      'Startup timeline [t]: exit 0.42s | session +2.31s | page +0.58s dom +0.68s | no files timed | no start-up steps recorded' +
        ' | longest: request→page 0.58s',
    );
  });

  it('splits a slow start into serving the files and running them', () => {
    const line = formatStartupTimeline('slow', launch, {
      timeOrigin: 11_000,
      html: 50,
      domContentLoaded: 0,
      load: 0,
      files: [{ name: 'http://tauri.localhost/assets/index.js', start: 60, end: 30_060 }],
      marks: [{ step: 'script', at: 41_200 }],
    });
    expect(line).toBe(
      'Startup timeline [slow]: exit 0.42s | session +2.31s | page +0.58s html +0.63s' +
        ' | files 1 served +30.64s, slowest index.js +0.64s→+30.64s | script +30.78s | longest: html→files 30.01s',
    );
  });

  it('counts every file while the app code never ran', () => {
    const line = formatStartupTimeline('hung', launch, {
      timeOrigin: 11_000,
      html: 50,
      domContentLoaded: 0,
      load: 0,
      files: [
        { name: 'a.js', start: 60, end: 100 },
        { name: 'b.js', start: 5_000, end: 5_200 },
      ],
      marks: [],
    });
    expect(line).toBe(
      'Startup timeline [hung]: exit 0.42s | session +2.31s | page +0.58s html +0.63s' +
        ' | files 2 served +5.78s, slowest b.js +5.58s→+5.78s | no start-up step reached | longest: html→files 5.15s',
    );
  });
});
