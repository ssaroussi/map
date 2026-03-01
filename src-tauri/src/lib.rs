use tauri::{Emitter, Manager};
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::WindowEvent;

#[tauri::command]
fn close_app(app: tauri::AppHandle) {
  app.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![close_app])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      let file_menu = Submenu::with_items(
        app,
        "File",
        true,
        &[
          &MenuItem::with_id(app, "new", "New", true, None::<&str>)?,
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
          &MenuItem::with_id(app, "export_md", "Export as Markdown…", true, None::<&str>)?,
          &PredefinedMenuItem::separator(app)?,
          &MenuItem::with_id(app, "close_window", "Close Window", true, Some("CmdOrCtrl+W"))?,
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

      let theme_menu = Submenu::with_items(
        app,
        "Theme",
        true,
        &[
          &MenuItem::with_id(app, "theme_default", "Default", true, None::<&str>)?,
          &MenuItem::with_id(app, "theme_hacker", "Hacker", true, None::<&str>)?,
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
          &PredefinedMenuItem::separator(app)?,
          &theme_menu,
        ],
      )?;

      let help_menu = Submenu::with_items(
        app,
        "Help",
        true,
        &[
          &MenuItem::with_id(app, "about", "About Map…", true, None::<&str>)?,
        ],
      )?;

      let menu = Menu::with_items(app, &[&file_menu, &edit_menu, &view_menu, &help_menu])?;
      app.set_menu(menu)?;

      app.on_menu_event(|app, event| {
        app.emit("menu-event", event.id().as_ref()).unwrap();
      });

      // Intercept window close — let the frontend decide whether to save first
      let win = app.get_webview_window("main").unwrap();
      let win_clone = win.clone();
      win.on_window_event(move |event| {
        if let WindowEvent::CloseRequested { api, .. } = event {
          api.prevent_close();
          let _ = win_clone.emit("close-requested", ());
        }
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
