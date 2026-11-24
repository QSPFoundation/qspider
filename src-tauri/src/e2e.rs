//! E2E builds only (`tauri build --debug`): the frontend reports startup markers through
//! `e2e_mark`, which prints them on stdout so a smoke runner can check a launch without WebDriver.
//! The module is compiled only with `debug_assertions`, so release builds do not contain it.
//!
//! `e2e_clear_webview_data` (Windows) clears the webview's browsing data, so the desktop E2E runner
//! can start the next scenario on the same WebView2 profile instead of deleting it: WebView2 holds a
//! brand-new profile's first request 0.3 s to 16 s on CI, an existing one's never
//! (`apps/player-e2e/targets/desktop/fresh-app.ts`).

use std::io::Write;
use tauri::command;

/// How long the runner's clear may take before it falls back to deleting the profile.
#[cfg_attr(not(windows), allow(dead_code))]
const CLEAR_TIMEOUT: std::time::Duration = std::time::Duration::from_secs(10);

const PREFIX: &str = "QSPIDER_E2E_MARK";

/// One stdout line: `QSPIDER_E2E_MARK <marker>[ <detail>]`, with line breaks in the detail
/// turned into spaces so the marker stays on a single line.
fn mark_line(marker: &str, detail: &str) -> String {
  let detail = detail.lines().collect::<Vec<_>>().join(" ");
  if detail.is_empty() {
    format!("{PREFIX} {marker}")
  } else {
    format!("{PREFIX} {marker} {detail}")
  }
}

#[command]
pub fn e2e_mark(marker: String, detail: String) {
  let mut out = std::io::stdout().lock();
  let _ = writeln!(out, "{}", mark_line(&marker, &detail));
  let _ = out.flush();
}

/// The URL the webview shows once `e2e_clear_webview_data` is done: `about:blank#cleared` or `#failed`.
#[cfg_attr(not(windows), allow(dead_code))]
fn clear_outcome_url(outcome: &Result<(), String>) -> &'static str {
  match outcome {
    Ok(()) => "about:blank#cleared",
    Err(_) => "about:blank#failed",
  }
}

/// Starts clearing all of the webview's browsing data (IndexedDB, local and session storage, caches,
/// cookies, service workers…) and returns. First the webview goes to `about:blank`, so no app code is
/// left to write anything after the clear; then WebView2's `ClearBrowsingDataAll` runs and is awaited
/// (Tauri's `clear_all_browsing_data` returns before it is done: wry ignores its completion); then the
/// webview goes to `about:blank#cleared` (or `#failed`), which the runner waits for over WebDriver.
#[cfg(windows)]
#[command]
pub fn e2e_clear_webview_data(webview: tauri::Webview) {
  std::thread::spawn(move || {
    // Lets this command's answer reach the page before the page goes away.
    std::thread::sleep(std::time::Duration::from_millis(100));
    let outcome = clear_on_blank(&webview);
    if let Err(e) = &outcome {
      eprintln!("e2e_clear_webview_data: {e}");
    }
    if let Ok(url) = clear_outcome_url(&outcome).parse() {
      let _ = webview.navigate(url);
    }
  });
}

#[cfg(windows)]
fn clear_on_blank(webview: &tauri::Webview) -> Result<(), String> {
  use webview2_com::ClearBrowsingDataCompletedHandler;
  use webview2_com::Microsoft::Web::WebView2::Win32::{ICoreWebView2Profile2, ICoreWebView2_13};
  use windows::core::Interface;

  let blank: tauri::Url = "about:blank".parse().map_err(|e| format!("{e}"))?;
  webview.navigate(blank).map_err(|e| e.to_string())?;
  let deadline = std::time::Instant::now() + CLEAR_TIMEOUT;
  while webview
    .url()
    .map(|url| url.as_str() != "about:blank")
    .unwrap_or(true)
  {
    if std::time::Instant::now() > deadline {
      return Err("the webview did not reach about:blank".to_string());
    }
    std::thread::sleep(std::time::Duration::from_millis(50));
  }

  let (tx, rx) = std::sync::mpsc::channel::<Result<(), String>>();
  webview
    .with_webview(move |platform| {
      let done = tx.clone();
      // SAFETY: WebView2 COM calls on the webview's own thread, where `with_webview` runs this.
      let started = unsafe {
        platform
          .controller()
          .CoreWebView2()
          .and_then(|core| core.cast::<ICoreWebView2_13>())
          .and_then(|core| core.Profile())
          .and_then(|profile| profile.cast::<ICoreWebView2Profile2>())
          .and_then(|profile| {
            profile.ClearBrowsingDataAll(&ClearBrowsingDataCompletedHandler::create(Box::new(
              move |result| {
                let _ = done.send(result.map_err(|e| e.to_string()));
                Ok(())
              },
            )))
          })
      };
      if let Err(e) = started {
        let _ = tx.send(Err(e.to_string()));
      }
    })
    .map_err(|e| e.to_string())?;
  rx.recv_timeout(CLEAR_TIMEOUT)
    .map_err(|_| format!("WebView2 did not finish clearing within {CLEAR_TIMEOUT:?}"))?
}

/// Only Windows needs it (`fresh-app.ts` keeps the WebView2 profile there alone); elsewhere it fails.
#[cfg(not(windows))]
#[command]
pub fn e2e_clear_webview_data() -> Result<(), String> {
  Err("e2e_clear_webview_data is Windows only".to_string())
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn the_outcome_url_tells_cleared_from_failed() {
    assert_eq!(clear_outcome_url(&Ok(())), "about:blank#cleared");
    assert_eq!(
      clear_outcome_url(&Err("x".to_string())),
      "about:blank#failed"
    );
  }

  #[test]
  fn marker_without_detail_has_no_trailing_space() {
    assert_eq!(
      mark_line("startup-finished", ""),
      "QSPIDER_E2E_MARK startup-finished"
    );
  }

  #[test]
  fn marker_with_detail() {
    assert_eq!(
      mark_line("game-running", "g1"),
      "QSPIDER_E2E_MARK game-running g1"
    );
  }

  #[test]
  fn detail_is_kept_on_one_line() {
    assert_eq!(
      mark_line("main-text", "a\nb\r\nc"),
      "QSPIDER_E2E_MARK main-text a b c"
    );
  }
}
