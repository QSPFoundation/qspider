use std::path::{Path, PathBuf};
use uuid::Uuid;

/// Parses `qsp://localhost/<uuid>/<path>` or `https://qsp.localhost/<uuid>/<path>`.
/// The host is ignored; `http::Uri` is avoided because it rejects raw spaces/Unicode.
pub fn parse_game_uri(uri: &str) -> Option<(Uuid, String)> {
  let after_scheme = uri.split_once("://")?.1;
  let after_host = after_scheme.split_once('/')?.1;
  // `?query` and `#fragment` are not part of the file name (an encoded `%3F` still is: it is decoded below).
  let after_host = after_host.split(['?', '#']).next()?;
  let decoded = urlencoding::decode(after_host).ok()?;
  let (uuid_str, rel) = decoded.split_once('/')?;
  let uuid = Uuid::parse_str(uuid_str).ok()?;
  Some((uuid, rel.to_string()))
}

/// Reads a game file: the exact path, else the path matched case-insensitively one segment at a time
/// (so `img/sub/CASE.png` finds `Img/Sub/Case.png`). `..` segments are passed through unchanged.
pub fn read_game_file(root: &Path, rel: &str) -> std::io::Result<Vec<u8>> {
  std::fs::read(root.join(rel)).or_else(|error| match find_ignoring_case(root, rel) {
    Some(path) => std::fs::read(path),
    None => Err(error),
  })
}

fn find_ignoring_case(root: &Path, rel: &str) -> Option<PathBuf> {
  let mut current = root.to_path_buf();
  for segment in rel.split('/') {
    if segment.is_empty() || segment == "." || segment == ".." {
      current.push(segment);
      continue;
    }
    let exact = current.join(segment);
    if exact.exists() {
      current = exact;
      continue;
    }
    let wanted = segment.to_lowercase();
    let found = std::fs::read_dir(&current)
      .ok()?
      .filter_map(Result::ok)
      .find(|entry| entry.file_name().to_string_lossy().to_lowercase() == wanted)?;
    current.push(found.file_name());
  }
  Some(current)
}

#[cfg(test)]
mod tests {
  use super::*;
  const ID: &str = "0f8fad5b-d9cb-469f-a165-70867728950e";
  #[test]
  fn parses_unix_form() {
    let (id, p) = parse_game_uri(&format!("qsp://localhost/{ID}/img/a.png")).unwrap();
    assert_eq!(id.to_string(), ID);
    assert_eq!(p, "img/a.png");
  }
  #[test]
  fn parses_windows_form() {
    let (_, p) = parse_game_uri(&format!("https://qsp.localhost/{ID}/game.cfg")).unwrap();
    assert_eq!(p, "game.cfg");
  }
  #[test]
  fn decodes_percent_encoding() {
    let (_, p) = parse_game_uri(&format!(
      "qsp://localhost/{ID}/%D0%BA%D0%B0%D1%80%D1%82%D0%B0%201.png"
    ))
    .unwrap();
    assert_eq!(p, "карта 1.png");
  }
  #[test]
  fn accepts_raw_unicode_and_spaces() {
    let (_, p) = parse_game_uri(&format!("qsp://localhost/{ID}/карта 1.png")).unwrap();
    assert_eq!(p, "карта 1.png");
  }
  #[test]
  fn rejects_missing_uuid_segment() {
    assert!(parse_game_uri("qsp://localhost/").is_none());
  }
  #[test]
  fn rejects_bad_uuid() {
    assert!(parse_game_uri("qsp://localhost/not-a-uuid/x.png").is_none());
  }
  #[test]
  fn rejects_no_scheme() {
    assert!(parse_game_uri("garbage").is_none());
  }
  fn temp_game() -> std::path::PathBuf {
    let dir = std::env::temp_dir().join(format!("qsp-test-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(dir.join("Img/Sub")).unwrap();
    std::fs::write(dir.join("Img/Sub/Case.png"), b"mixed").unwrap();
    std::fs::write(dir.join("Img/Pic.png"), b"pic").unwrap();
    dir
  }
  #[test]
  fn reads_an_exact_path() {
    let dir = temp_game();
    assert_eq!(read_game_file(&dir, "Img/Sub/Case.png").unwrap(), b"mixed");
  }
  #[test]
  fn reads_with_case_matched_per_segment() {
    let dir = temp_game();
    assert_eq!(read_game_file(&dir, "img/sub/CASE.png").unwrap(), b"mixed");
    assert_eq!(read_game_file(&dir, "IMG/Pic.PNG").unwrap(), b"pic");
  }
  #[test]
  fn reports_a_missing_file() {
    let dir = temp_game();
    assert!(read_game_file(&dir, "missing.png").is_err());
    assert!(read_game_file(&dir, "img/nope/case.png").is_err());
  }
  #[test]
  fn strips_query_and_fragment() {
    let (_, p) = parse_game_uri(&format!("qsp://localhost/{ID}/Img/Sub/Query.png?v=2")).unwrap();
    assert_eq!(p, "Img/Sub/Query.png");
    let (_, p) = parse_game_uri(&format!("qsp://localhost/{ID}/a b.png#frag")).unwrap();
    assert_eq!(p, "a b.png");
  }
  #[test]
  fn keeps_an_encoded_question_mark_in_the_name() {
    let (_, p) = parse_game_uri(&format!("qsp://localhost/{ID}/what%3F.png")).unwrap();
    assert_eq!(p, "what?.png");
  }
}
