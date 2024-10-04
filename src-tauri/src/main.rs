#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use mime_guess::Mime;
use std::path::Path;
use std::sync::Mutex;
use std::{collections::HashMap, path::PathBuf, sync::Arc};
use tauri::http::header::ACCESS_CONTROL_ALLOW_ORIGIN;
use tauri::http::ResponseBuilder;
use tauri::{command, Manager, State};
use urlencoding::decode;
use uuid::Uuid;

#[derive(Default)]
struct GamesPath(Arc<Mutex<HashMap<Uuid, String>>>);

#[command]
fn prepare_game_start(
  path: String,
  id: String,
  state: State<'_, GamesPath>,
) -> Result<bool, String> {
  let uuid = Uuid::parse_str(&id).unwrap();
  let d = decode(&path);
  match d {
    Ok(decoded) => {
      let uri = decoded.into_owned();
      let file_path = Path::new(&uri);
      if !file_path.exists() {
        return Err("path does not exists".to_string());
      }
      state
        .0
        .lock()
        .unwrap()
        .insert(uuid, file_path.to_string_lossy().to_string());
      return Ok(true);
    }
    _ => return Err("".to_string()),
  }
}

fn read_file(path: &Path, check_lowercase: bool) -> Result<Vec<u8>, String> {
  let file_result = std::fs::read(path);
  match file_result {
    Ok(buf) => {
      return Ok(buf);
    }
    Err(e) => {
      if check_lowercase {
        return read_file(
          path.to_str().unwrap_or_default().to_lowercase().as_ref(),
          false,
        );
      }
      return Err(e.to_string());
    }
  }
}

#[command]
fn read_resource(url: String, state: State<'_, GamesPath>) -> Result<Vec<u8>, String> {
  let uri = url.replace("qsp://", "").replace("https://qsp.", "");
  let path = decode(&uri).unwrap_or_default();
  let slash_index = path.chars().position(|c| c == '/').unwrap();
  let uuid_str = &path[0..slash_index];
  let uuid = Uuid::parse_str(uuid_str).unwrap_or_default();
  let game_path = state.0.lock().unwrap().get(&uuid).cloned();

  match game_path {
    Some(game_path) => {
      let mut file_path = PathBuf::from(game_path.clone());
      file_path.push(&path[slash_index + 1..]);
      return read_file(&file_path, true);
    }
    None => {
      print!("Game {} not found", uuid);
      return Err("Game not found".to_string());
    }
  }
}

fn main() {
  std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
  let context = tauri::generate_context!();
  tauri::Builder::default()
    .manage(GamesPath(Default::default()))
    .register_uri_scheme_protocol("qsp", move |app, request| {
      let state: State<'_, GamesPath> = app.try_state().unwrap();

      // prepare our response
      let response = ResponseBuilder::new().header(ACCESS_CONTROL_ALLOW_ORIGIN, "*");
      if request.method() == "POST" {
        return response.status(200).body(Vec::new());
      }
      // get the wanted path
      let uri = request.uri().replace("qsp://", "");
      let path = decode(&uri)?;
      let slash_index = path.chars().position(|c| c == '/').unwrap();
      let uuid_str = &path[0..slash_index];
      let uuid = Uuid::parse_str(uuid_str)?;
      let game_path = state.0.lock().unwrap().get(&uuid).cloned();
      match game_path {
        Some(game_path) => {
          let mut file_path = PathBuf::from(game_path.clone());
          file_path.push(&path[slash_index + 1..]);
          let file_result = read_file(&file_path.as_path(), true);
          match file_result {
            Ok(buf) => {
              let guess = mime_guess::from_path(path.to_string());

              return response
                .mimetype(
                  guess
                    .first_or("application/octet-stream".parse::<Mime>()?)
                    .essence_str(),
                )
                .status(200)
                .body(buf);
            }
            Err(_) => {
              return response.mimetype("text/plain").status(404).body(Vec::new());
            }
          }
        }
        None => {
          print!("Game {} not found", uuid);
          return response.mimetype("text/plain").status(404).body(Vec::new());
        }
      }
    })
    .invoke_handler(tauri::generate_handler![prepare_game_start, read_resource])
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .run(context)
    .expect("error while running tauri application");
}
