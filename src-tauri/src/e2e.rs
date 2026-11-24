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

/// Clears all of the webview's browsing data (IndexedDB, local and session storage, caches, cookies,
/// service workers…) and resolves once WebView2 reports it done. Tauri's `clear_all_browsing_data`
/// returns before that (wry ignores the completion), and the runner closes the app right after.
#[cfg(windows)]
#[command]
pub async fn e2e_clear_webview_data(webview: tauri::Webview) -> Result<(), String> {
  use webview2_com::ClearBrowsingDataCompletedHandler;
  use webview2_com::Microsoft::Web::WebView2::Win32::{ICoreWebView2Profile2, ICoreWebView2_13};
  use windows::core::Interface;

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
  tauri::async_runtime::spawn_blocking(move || {
    rx.recv_timeout(CLEAR_TIMEOUT)
      .map_err(|_| format!("WebView2 did not finish clearing within {CLEAR_TIMEOUT:?}"))?
  })
  .await
  .map_err(|e| e.to_string())?
}

/// Only Windows needs it (`fresh-app.ts` keeps the WebView2 profile there alone); elsewhere it says so.
#[cfg(not(windows))]
#[command]
pub async fn e2e_clear_webview_data() -> Result<(), String> {
  Err("e2e_clear_webview_data is Windows only".to_string())
}

#[cfg(test)]
mod tests {
  use super::*;

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
