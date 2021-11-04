#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use entity_tag::EntityTag;
use mime_guess::Mime;
use std::path::Path;
use std::sync::Mutex;
use std::{collections::HashMap, io::Read, path::PathBuf, sync::Arc};
use tauri::http::ResponseBuilder;
use tauri::{command, Manager, State};
use uuid::Uuid;

#[derive(Default)]
struct GamesPath(Arc<Mutex<HashMap<Uuid, String>>>);

#[command]
fn prepare_game_start(path: Option<String>, state: State<'_, GamesPath>) -> Result<Uuid, String> {
  let uuid = Uuid::new_v4();
  match path {
    Some(p) => {
      let file_path = Path::new(&p);
      if !file_path.exists() {
        return Err("path does not exists".to_string());
      }
      state.0.lock().unwrap().insert(
        uuid,
        file_path.parent().unwrap().to_string_lossy().to_string(),
      );
      return Ok(uuid);
    }
    None => return Err("path is required".to_string()),
  }
}

fn main() {
  let context = tauri::generate_context!();
  tauri::Builder::default()
    .manage(GamesPath(Default::default()))
    .register_uri_scheme_protocol("qsp", move |app, request| {
      let state: State<'_, GamesPath> = app.try_state().unwrap();
      // prepare our response
      let response = ResponseBuilder::new().header("Access-Control-Allow-Origin", "*");
      if request.method() == "POST" {
        return response.status(200).body(Vec::new());
      }
      // get the wanted path
      let path = request.uri().replace("qsp://", "");
      let slash_index = path.chars().position(|c| c == '/').unwrap();
      let uuid_str = &path[0..slash_index];
      let uuid = Uuid::parse_str(uuid_str)?;
      let game_path = state.0.lock().unwrap().get(&uuid).cloned();
      println!("{} {:?}", path, game_path);
      let mut file_path = PathBuf::from(game_path.unwrap().clone());
      file_path.push(&path[slash_index + 1..]);
      println!("{}", file_path.to_str().unwrap());
      let file_result = std::fs::File::open(&file_path);
      match file_result {
        Ok(mut file) => {
          let mut buf = Vec::new();
          file.read_to_end(&mut buf)?;
          let etag4 = EntityTag::from_file_meta(&file.metadata().unwrap());
          let guess = mime_guess::from_path(path);

          return response
            .header("ETag", etag4.to_string())
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
    })
    .invoke_handler(tauri::generate_handler![prepare_game_start])
    .run(context)
    .expect("error while running tauri application");
}
