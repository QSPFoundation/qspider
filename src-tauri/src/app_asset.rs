/// The origins the app's own frontend is served from: `tauri://localhost` (Linux, macOS) and
/// `http(s)://tauri.localhost` (Windows).
const APP_ORIGINS: [&str; 3] = [
  "tauri://localhost",
  "http://tauri.localhost",
  "https://tauri.localhost",
];

/// The embedded-asset key for an app URL, mapped as Tauri's asset protocol does
/// (`tauri::protocol::tauri` + `AppManager::get_asset`): no query or fragment, no origin, no trailing
/// `/`, percent-decoded (lossy), no leading `/`, and `index.html` for the root. `None` for any other
/// origin.
pub fn asset_key(url: &str) -> Option<String> {
  let without_query = url.split(['?', '#']).next()?;
  let mut path = APP_ORIGINS
    .iter()
    .find_map(|origin| {
      without_query
        .strip_prefix(origin)
        .filter(|rest| rest.is_empty() || rest.starts_with('/'))
    })?
    .to_string();
  if path.ends_with('/') {
    path.pop();
  }
  let decoded = String::from_utf8_lossy(&urlencoding::decode_binary(path.as_bytes())).into_owned();
  if decoded.is_empty() {
    return Some("index.html".to_string());
  }
  Some(decoded.strip_prefix('/').unwrap_or(&decoded).to_string())
}

/// Whether `key` (from `asset_key`) is one of the embedded asset keys, which have a leading `/`.
/// Exact only: unlike the asset protocol, no fallback to `<key>.html`, `<key>/index.html` or
/// `index.html`, so a missing file is reported as missing.
pub fn has_asset(keys: impl IntoIterator<Item = impl AsRef<str>>, key: &str) -> bool {
  keys
    .into_iter()
    .any(|k| k.as_ref().strip_prefix('/') == Some(key))
}

/// `key` (decoded by `asset_key`) as the path `AssetResolver::get` takes: it percent-decodes again, so a
/// literal `%` (a file named `a%20b.txt`) is escaped to survive that second decoding.
pub fn resolver_path(key: &str) -> String {
  key.replace('%', "%25")
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn resolver_path_survives_the_second_decoding() {
    for key in [
      "game/a%20b.txt",
      "game/100%.png",
      "game/plain.cfg",
      "game/ф.png",
    ] {
      let path = resolver_path(key);
      let decoded =
        String::from_utf8_lossy(&urlencoding::decode_binary(path.as_bytes())).into_owned();
      assert_eq!(decoded, key);
    }
  }

  #[test]
  fn maps_app_urls_on_every_origin() {
    for origin in APP_ORIGINS {
      assert_eq!(
        asset_key(&format!("{origin}/game/game.cfg")).as_deref(),
        Some("game/game.cfg")
      );
    }
  }

  #[test]
  fn drops_query_fragment_and_trailing_slash() {
    assert_eq!(
      asset_key("tauri://localhost/game/a.qsps?v=1#x").as_deref(),
      Some("game/a.qsps")
    );
    assert_eq!(
      asset_key("tauri://localhost/game/dir/").as_deref(),
      Some("game/dir")
    );
  }

  #[test]
  fn percent_decodes_after_dropping_the_query() {
    assert_eq!(
      asset_key("tauri://localhost/game/my%20file%3F.txt").as_deref(),
      Some("game/my file?.txt")
    );
    assert_eq!(
      asset_key("tauri://localhost/game/%D1%84.png").as_deref(),
      Some("game/ф.png")
    );
  }

  #[test]
  fn root_is_index_html() {
    assert_eq!(
      asset_key("tauri://localhost").as_deref(),
      Some("index.html")
    );
    assert_eq!(
      asset_key("tauri://localhost/").as_deref(),
      Some("index.html")
    );
  }

  #[test]
  fn other_origins_are_not_app_urls() {
    assert_eq!(asset_key("https://example.com/game/game.cfg"), None);
    assert_eq!(asset_key("qsp://localhost/abc/game.cfg"), None);
    assert_eq!(asset_key("tauri://localhostevil/game.cfg"), None);
  }

  #[test]
  fn finds_only_exact_keys() {
    let keys = ["/index.html", "/game/game.cfg"];
    assert!(has_asset(keys, "game/game.cfg"));
    assert!(!has_asset(keys, "game/missing.cfg"));
    assert!(!has_asset(keys, "game"));
  }
}
