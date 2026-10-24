#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod app_asset;
mod game_uri;

use game_uri::{parse_game_uri, read_game_file};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::{collections::HashMap, sync::Arc};
use tauri::http::header::{ACCESS_CONTROL_ALLOW_ORIGIN, CONTENT_TYPE};
use tauri::{command, AppHandle, Manager, State};
use urlencoding::decode;
use uuid::Uuid;

#[derive(Default)]
struct GamesPath(Arc<Mutex<HashMap<Uuid, String>>>);

impl GamesPath {
  fn root(&self, id: &Uuid) -> Option<PathBuf> {
    self
      .0
      .lock()
      .ok()
      .and_then(|m| m.get(id).cloned())
      .map(PathBuf::from)
  }
}

#[command]
fn prepare_game_start(
  path: String,
  id: String,
  state: State<'_, GamesPath>,
) -> Result<bool, String> {
  let uuid = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
  let decoded = decode(&path).map_err(|e| e.to_string())?;
  let file_path = Path::new(decoded.as_ref());
  if !file_path.exists() {
    return Err("path does not exists".to_string());
  }
  state
    .0
    .lock()
    .map_err(|e| e.to_string())?
    .insert(uuid, file_path.to_string_lossy().to_string());
  Ok(true)
}

#[command]
fn read_resource(url: String, state: State<'_, GamesPath>) -> Result<tauri::ipc::Response, String> {
  let (uuid, rel) = parse_game_uri(&url).ok_or_else(|| "invalid url".to_string())?;
  let root = state
    .root(&uuid)
    .ok_or_else(|| "Game not found".to_string())?;
  let buf = read_game_file(&root, &rel).map_err(|e| e.to_string())?;
  Ok(tauri::ipc::Response::new(buf))
}

/// Reads a file of the app's own frontend (a standalone game's bundled files) by its URL. A missing
/// file is an error, where the asset protocol would answer with index.html.
#[command]
fn read_app_asset(url: String, app: AppHandle) -> Result<tauri::ipc::Response, String> {
  let key = app_asset::asset_key(&url).ok_or_else(|| "not an app url".to_string())?;
  let resolver = app.asset_resolver();
  if !app_asset::has_asset(resolver.iter().map(|(k, _)| k), &key) {
    return Err(format!("file not found: {key}"));
  }
  let asset = resolver
    .get(key.clone())
    .ok_or_else(|| format!("file not found: {key}"))?;
  Ok(tauri::ipc::Response::new(asset.bytes))
}

fn respond(status: u16, mime: &str, body: Vec<u8>) -> tauri::http::Response<Vec<u8>> {
  let mut response = tauri::http::Response::new(body);
  *response.status_mut() = tauri::http::StatusCode::from_u16(status)
    .unwrap_or(tauri::http::StatusCode::INTERNAL_SERVER_ERROR);
  let headers = response.headers_mut();
  headers.insert(
    ACCESS_CONTROL_ALLOW_ORIGIN,
    tauri::http::HeaderValue::from_static("*"),
  );
  if let Ok(v) = tauri::http::HeaderValue::from_str(mime) {
    headers.insert(CONTENT_TYPE, v);
  }
  response
}

fn main() {
  std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
  let builder = tauri::Builder::default()
    .manage(GamesPath(Default::default()))
    .register_uri_scheme_protocol("qsp", |ctx, request| {
      if request.method() == "POST" {
        return respond(200, "text/plain", Vec::new());
      }
      let Some((uuid, rel)) = parse_game_uri(&request.uri().to_string()) else {
        return respond(400, "text/plain", Vec::new());
      };
      let state = ctx.app_handle().state::<GamesPath>();
      let Some(root) = state.root(&uuid) else {
        return respond(404, "text/plain", Vec::new());
      };
      match read_game_file(&root, &rel) {
        Ok(buf) => {
          let mime =
            mime_guess::from_path(&rel).first_or(mime_guess::mime::APPLICATION_OCTET_STREAM);
          respond(200, mime.essence_str(), buf)
        }
        Err(_) => respond(404, "text/plain", Vec::new()),
      }
    })
    .invoke_handler(tauri::generate_handler![
      prepare_game_start,
      read_resource,
      read_app_asset
    ])
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_window_state::Builder::default().build());

  #[cfg(desktop)]
  let builder = builder.plugin(tauri_plugin_cli::init()).setup(|app| {
    // Standalone games may ship without updater config.
    if app.config().plugins.0.contains_key("updater") {
      app
        .handle()
        .plugin(tauri_plugin_updater::Builder::new().build())?;
    }
    Ok(())
  });

  builder
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
