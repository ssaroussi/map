use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};

      let file_menu = Submenu::with_items(
        app,
        "File",
        true,
        &[
          &MenuItem::with_id(app, "new", "New", true, Some("CmdOrCtrl+N"))?,
          &MenuItem::with_id(app, "open", "Open…", true, Some("CmdOrCtrl+O"))?,
          &PredefinedMenuItem::separator(app)?,
          &MenuItem::with_id(app, "save", "Save", true, Some("CmdOrCtrl+S"))?,
          &MenuItem::with_id(
            app,
            "save_as",
            "Save As…",
            true,
            Some("CmdOrCtrl+Shift+S"),
          )?,
          &PredefinedMenuItem::separator(app)?,
          &MenuItem::with_id(app, "export_png", "Export as PNG…", true, None::<&str>)?,
        ],
      )?;

      let edit_menu = Submenu::with_items(
        app,
        "Edit",
        true,
        &[
          &MenuItem::with_id(app, "undo", "Undo", true, Some("CmdOrCtrl+Z"))?,
          &MenuItem::with_id(app, "redo", "Redo", true, Some("CmdOrCtrl+Y"))?,
        ],
      )?;

      let view_menu = Submenu::with_items(
        app,
        "View",
        true,
        &[
          &MenuItem::with_id(app, "zoom_in", "Zoom In", true, Some("CmdOrCtrl+="))?,
          &MenuItem::with_id(app, "zoom_out", "Zoom Out", true, Some("CmdOrCtrl+-"))?,
          &MenuItem::with_id(app, "fit", "Fit to Screen", true, Some("CmdOrCtrl+0"))?,
          &PredefinedMenuItem::separator(app)?,
          &MenuItem::with_id(app, "magic", "Magic Layout", true, None::<&str>)?,
        ],
      )?;

      let menu = Menu::with_items(app, &[&file_menu, &edit_menu, &view_menu])?;
      app.set_menu(menu)?;

      app.on_menu_event(|app, event| {
        app.emit("menu-event", event.id().as_ref()).unwrap();
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
