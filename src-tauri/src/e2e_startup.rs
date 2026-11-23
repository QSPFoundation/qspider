//! Debug builds only (E2E builds are `tauri build --debug`): a record of the app's own start-up, which
//! the desktop E2E runner reads through `e2e_startup_trace` and prints in its start-up timeline
//! (`apps/player-e2e/targets/desktop/startup-timeline.ts`). It is there to root-cause slow start-ups
//! on Windows CI, where the webview waits seconds for the first answer to its request for index.html,
//! which Tauri gives on the main thread.
//!
//! Steps are wall-clock ms since the Unix epoch, as the page's `Date.now()`. A heartbeat thread asks
//! the main thread to run a no-op every `BEAT_EVERY` for `BEAT_FOR` after start, and records each
//! wait of at least `STALL_MS` as a stall.

use serde::Serialize;
use std::sync::{mpsc, Mutex};
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{command, AppHandle};

const STALL_MS: u64 = 250;
const BEAT_EVERY: Duration = Duration::from_millis(50);
const BEAT_FOR: Duration = Duration::from_secs(60);
/// A stall longer than this is recorded as still going on when the heartbeat gives up waiting.
const BEAT_TIMEOUT: Duration = Duration::from_secs(60);

#[derive(Serialize, Clone, Debug, PartialEq)]
pub struct Step {
  step: String,
  at: u64,
}

#[derive(Serialize, Clone, Debug, PartialEq)]
pub struct Stall {
  from: u64,
  to: u64,
}

#[derive(Serialize, Clone, Debug, Default, PartialEq)]
pub struct Trace {
  steps: Vec<Step>,
  stalls: Vec<Stall>,
}

impl Trace {
  fn step(&mut self, step: &str, at: u64) {
    self.steps.push(Step {
      step: step.to_string(),
      at,
    });
  }

  /// One heartbeat: asked the main thread at `sent`, it ran the beat at `ran`.
  fn beat(&mut self, sent: u64, ran: u64) {
    if ran.saturating_sub(sent) >= STALL_MS {
      self.stalls.push(Stall {
        from: sent,
        to: ran,
      });
    }
  }
}

static TRACE: Mutex<Trace> = Mutex::new(Trace {
  steps: Vec::new(),
  stalls: Vec::new(),
});

fn now() -> u64 {
  SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .map(|d| d.as_millis() as u64)
    .unwrap_or(0)
}

/// Records that start-up reached `step` now.
pub fn step(step: &str) {
  let at = now();
  if let Ok(mut trace) = TRACE.lock() {
    trace.step(step, at);
  }
}

/// Starts the main-thread heartbeat; it stops by itself after `BEAT_FOR`.
pub fn start_heartbeat(app: AppHandle) {
  thread::spawn(move || {
    let started = now();
    while now().saturating_sub(started) < BEAT_FOR.as_millis() as u64 {
      let sent = now();
      let (tx, rx) = mpsc::channel();
      if app
        .run_on_main_thread(move || {
          let _ = tx.send(now());
        })
        .is_err()
      {
        return;
      }
      let ran = rx.recv_timeout(BEAT_TIMEOUT).unwrap_or_else(|_| now());
      if let Ok(mut trace) = TRACE.lock() {
        trace.beat(sent, ran);
      }
      thread::sleep(BEAT_EVERY);
    }
  });
}

#[command]
pub fn e2e_startup_trace() -> Trace {
  TRACE.lock().map(|trace| trace.clone()).unwrap_or_default()
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn a_short_wait_is_not_a_stall() {
    let mut trace = Trace::default();
    trace.beat(1_000, 1_000 + STALL_MS - 1);
    assert!(trace.stalls.is_empty());
  }

  #[test]
  fn a_long_wait_is_a_stall_from_ask_to_run() {
    let mut trace = Trace::default();
    trace.beat(1_000, 16_000);
    assert_eq!(
      trace.stalls,
      vec![Stall {
        from: 1_000,
        to: 16_000
      }]
    );
  }

  #[test]
  fn steps_keep_their_order() {
    let mut trace = Trace::default();
    trace.step("process", 1);
    trace.step("setup", 2);
    let names: Vec<_> = trace.steps.iter().map(|s| s.step.as_str()).collect();
    assert_eq!(names, ["process", "setup"]);
  }
}
