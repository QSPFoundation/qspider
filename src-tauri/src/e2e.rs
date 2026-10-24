//! E2E builds only (`tauri build --debug`): the frontend reports startup markers through
//! `e2e_mark`, which prints them on stdout so a smoke runner can check a launch without WebDriver.
//! The module is compiled only with `debug_assertions`, so release builds do not contain it.

use std::io::Write;
use tauri::command;

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
