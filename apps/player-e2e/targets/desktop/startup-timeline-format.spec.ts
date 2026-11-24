import { describe, expect, it } from 'vitest';
import { formatStartupTimeline } from './startup-timeline-format';

const launch = { restartBegin: 10_000, requested: 10_420, ready: 12_730 };

describe('formatStartupTimeline', () => {
  it('lists the session, the page and every start-up step relative to the request, and the longest gap', () => {
    const line = formatStartupTimeline('a scenario', launch, {
      timeOrigin: 11_520,
      fetch: 2,
      sent: 10,
      firstByte: 18,
      html: 20,
      domContentLoaded: 850,
      load: 900,
      native: null,
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
      'Startup timeline [a scenario]: exit 0.42s | session +2.31s | page +1.10s fetch +1.10s sent +1.11s first-byte +1.12s html +1.12s dom +1.95s load +2.00s' +
        ' | no rust trace | files 2 served +1.80s, slowest index-abc.js +1.13s→+1.80s' +
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
      fetch: 0,
      sent: 0,
      firstByte: 0,
      html: 0,
      domContentLoaded: 0,
      load: 0,
      marks: [],
      native: null,
      files: [],
    });
    expect(line).toBe(
      'Startup timeline [t]: exit 0.42s | session +2.31s | page +0.58s | no rust trace | no files timed | no start-up step reached' +
        ' | longest: request→page 0.58s',
    );
  });

  it('says so when the build records no start-up steps', () => {
    const line = formatStartupTimeline('t', launch, {
      timeOrigin: 11_000,
      fetch: 0,
      sent: 0,
      firstByte: 0,
      html: 0,
      domContentLoaded: 100,
      load: 0,
      marks: null,
      native: null,
      files: [],
    });
    expect(line).toBe(
      'Startup timeline [t]: exit 0.42s | session +2.31s | page +0.58s dom +0.68s | no rust trace | no files timed | no start-up steps recorded' +
        ' | longest: request→page 0.58s',
    );
  });

  it('splits a slow start into serving the files and running them', () => {
    const line = formatStartupTimeline('slow', launch, {
      timeOrigin: 11_000,
      fetch: 2,
      sent: 0,
      firstByte: 0,
      html: 50,
      domContentLoaded: 0,
      load: 0,
      native: null,
      files: [{ name: 'http://tauri.localhost/assets/index.js', start: 60, end: 30_060 }],
      marks: [{ step: 'script', at: 41_200 }],
    });
    expect(line).toBe(
      'Startup timeline [slow]: exit 0.42s | session +2.31s | page +0.58s fetch +0.58s html +0.63s' +
        ' | no rust trace | files 1 served +30.64s, slowest index.js +0.64s→+30.64s | script +30.78s | longest: html→files 30.01s',
    );
  });

  it('counts every file while the app code never ran', () => {
    const line = formatStartupTimeline('hung', launch, {
      timeOrigin: 11_000,
      fetch: 2,
      sent: 0,
      firstByte: 0,
      html: 50,
      domContentLoaded: 0,
      load: 0,
      native: null,
      files: [
        { name: 'a.js', start: 60, end: 100 },
        { name: 'b.js', start: 5_000, end: 5_200 },
      ],
      marks: [],
    });
    expect(line).toBe(
      'Startup timeline [hung]: exit 0.42s | session +2.31s | page +0.58s fetch +0.58s html +0.63s' +
        ' | no rust trace | files 2 served +5.78s, slowest b.js +5.58s→+5.78s | no start-up step reached | longest: html→files 5.15s',
    );
  });

  it('splits waiting for the HTML into sending the request and the app answering it', () => {
    const line = formatStartupTimeline('slow html', launch, {
      timeOrigin: 11_000,
      fetch: 3,
      sent: 9_000,
      firstByte: 9_100,
      html: 9_110,
      domContentLoaded: 0,
      load: 0,
      native: null,
      files: [],
      marks: null,
    });
    expect(line).toBe(
      'Startup timeline [slow html]: exit 0.42s | session +2.31s' +
        ' | page +0.58s fetch +0.58s sent +9.58s first-byte +9.68s html +9.69s | no rust trace | no files timed' +
        ' | no start-up steps recorded | longest: fetch→sent 9.00s',
    );
  });

  it('shows the Rust side: its start-up steps and the longest main-thread stalls in time order', () => {
    const line = formatStartupTimeline('rust', launch, {
      timeOrigin: 11_000,
      fetch: 3,
      sent: 10,
      firstByte: 9_100,
      html: 9_110,
      domContentLoaded: 0,
      load: 0,
      files: [],
      marks: null,
      native: {
        steps: [
          { step: 'process', at: 10_500 },
          { step: 'setup', at: 10_700 },
          { step: 'ready', at: 10_710 },
        ],
        stalls: [
          { from: 10_720, to: 11_000 },
          { from: 11_010, to: 20_000 },
          { from: 20_100, to: 20_400 },
          { from: 21_000, to: 21_260 },
        ],
      },
    });
    expect(line).toBe(
      'Startup timeline [rust]: exit 0.42s | session +2.31s' +
        ' | page +0.58s fetch +0.58s sent +0.59s first-byte +9.68s html +9.69s' +
        ' | rust process +0.08s setup +0.28s ready +0.29s' +
        ' | main thread stalled 4x: +0.30s→+0.58s (0.28s) +0.59s→+9.58s (8.99s) +9.68s→+9.98s (0.30s)' +
        ' | no files timed | no start-up steps recorded | longest: stall→stall-end 8.99s',
    );
  });

  it('says when the main thread never stalled', () => {
    const line = formatStartupTimeline('calm', launch, {
      timeOrigin: 11_000,
      fetch: 0,
      sent: 0,
      firstByte: 0,
      html: 50,
      domContentLoaded: 0,
      load: 0,
      files: [],
      marks: null,
      native: { steps: [{ step: 'process', at: 10_600 }], stalls: [] },
    });
    expect(line).toBe(
      'Startup timeline [calm]: exit 0.42s | session +2.31s | page +0.58s html +0.63s | rust process +0.18s' +
        ' | main thread never stalled | no files timed | no start-up steps recorded | longest: process→page 0.40s',
    );
  });
});
