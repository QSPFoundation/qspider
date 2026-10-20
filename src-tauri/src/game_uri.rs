use std::path::Path;
use uuid::Uuid;

/// Parses `qsp://localhost/<uuid>/<path>` or `https://qsp.localhost/<uuid>/<path>`.
/// The host is ignored; `http::Uri` is avoided because it rejects raw spaces/Unicode.
pub fn parse_game_uri(uri: &str) -> Option<(Uuid, String)> {
  let after_scheme = uri.split_once("://")?.1;
  let after_host = after_scheme.split_once('/')?.1;
  let decoded = urlencoding::decode(after_host).ok()?;
  let (uuid_str, rel) = decoded.split_once('/')?;
  let uuid = Uuid::parse_str(uuid_str).ok()?;
  Some((uuid, rel.to_string()))
}

/// Reads a game file, retrying once with a lowercased relative path.
pub fn read_game_file(root: &Path, rel: &str) -> std::io::Result<Vec<u8>> {
  std::fs::read(root.join(rel)).or_else(|_| std::fs::read(root.join(rel.to_lowercase())))
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
  #[test]
  fn reads_with_lowercase_fallback() {
    let dir = std::env::temp_dir().join(format!("qsp-test-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(dir.join("img")).unwrap();
    std::fs::write(dir.join("img/pic.png"), b"x").unwrap();
    assert_eq!(read_game_file(&dir, "IMG/Pic.PNG").unwrap(), b"x");
    assert!(read_game_file(&dir, "missing.png").is_err());
  }
}
