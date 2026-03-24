"use strict";
const electron = require("electron");
const utils = require("@electron-toolkit/utils");
const Database = require("better-sqlite3");
const path = require("path");
const node_crypto = require("node:crypto");
let db;
const CURRENT_VERSION = 1;
const SCHEMA_V1 = `
  CREATE TABLE IF NOT EXISTS schema_version (
    version     INTEGER NOT NULL DEFAULT 1,
    applied_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS stamps (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    color       TEXT NOT NULL DEFAULT '#6366f1',
    sort_order  REAL NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    archived_at TEXT,
    sort_order  REAL NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS project_stamps (
    id            TEXT PRIMARY KEY,
    project_id    TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stamp_id      TEXT NOT NULL REFERENCES stamps(id) ON DELETE RESTRICT,
    status        TEXT NOT NULL DEFAULT 'pending'
                    CHECK(status IN ('pending', 'in_progress', 'completed')),
    sort_order    REAL NOT NULL DEFAULT 0,
    completed_at  TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS commits (
    id                TEXT PRIMARY KEY,
    project_id        TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    project_stamp_id  TEXT NOT NULL REFERENCES project_stamps(id) ON DELETE CASCADE,
    note              TEXT NOT NULL DEFAULT '',
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_project_stamps_project ON project_stamps(project_id);
  CREATE INDEX IF NOT EXISTS idx_project_stamps_stamp ON project_stamps(stamp_id);
  CREATE INDEX IF NOT EXISTS idx_commits_project ON commits(project_id);
  CREATE INDEX IF NOT EXISTS idx_commits_project_stamp ON commits(project_stamp_id);
`;
function getDbVersion() {
  try {
    const row = db.prepare("SELECT MAX(version) as version FROM schema_version").get();
    return row?.version ?? 0;
  } catch {
    return 0;
  }
}
function migrate() {
  const version = getDbVersion();
  if (version < 1) {
    db.exec(SCHEMA_V1);
    db.prepare("INSERT INTO schema_version (version) VALUES (?)").run(CURRENT_VERSION);
  }
}
function initDatabase() {
  const dbPath = path.join(electron.app.getPath("userData"), "driftlog.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate();
  return db;
}
function getDatabase() {
  if (!db) throw new Error("Database not initialized");
  return db;
}
let urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
const POOL_SIZE_MULTIPLIER = 128;
let pool, poolOffset;
function fillPool(bytes) {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
    node_crypto.webcrypto.getRandomValues(pool);
    poolOffset = 0;
  } else if (poolOffset + bytes > pool.length) {
    node_crypto.webcrypto.getRandomValues(pool);
    poolOffset = 0;
  }
  poolOffset += bytes;
}
function nanoid(size = 21) {
  fillPool(size |= 0);
  let id = "";
  for (let i = poolOffset - size; i < poolOffset; i++) {
    id += urlAlphabet[pool[i] & 63];
  }
  return id;
}
const IPC = {
  STAMPS: {
    LIST: "stamps:list",
    CREATE: "stamps:create",
    UPDATE: "stamps:update",
    DELETE: "stamps:delete"
  },
  PROJECTS: {
    LIST: "projects:list",
    CREATE: "projects:create",
    UPDATE: "projects:update",
    DELETE: "projects:delete",
    ARCHIVE: "projects:archive"
  },
  PROJECT_STAMPS: {
    LIST: "project-stamps:list",
    ADD: "project-stamps:add",
    REMOVE: "project-stamps:remove",
    REORDER: "project-stamps:reorder",
    SET_STATUS: "project-stamps:set-status"
  },
  COMMITS: {
    LIST: "commits:list",
    CREATE: "commits:create"
  },
  WINDOW: {
    HIDE: "window:hide"
  }
};
function registerStampHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle(IPC.STAMPS.LIST, () => {
    return db2.prepare("SELECT * FROM stamps ORDER BY sort_order ASC").all();
  });
  electron.ipcMain.handle(IPC.STAMPS.CREATE, (_, input) => {
    const id = nanoid();
    const maxOrder = db2.prepare("SELECT MAX(sort_order) as max FROM stamps").get();
    const sort_order = (maxOrder?.max ?? 0) + 1;
    db2.prepare("INSERT INTO stamps (id, name, color, sort_order) VALUES (?, ?, ?, ?)").run(
      id,
      input.name,
      input.color,
      sort_order
    );
    return db2.prepare("SELECT * FROM stamps WHERE id = ?").get(id);
  });
  electron.ipcMain.handle(
    IPC.STAMPS.UPDATE,
    (_, id, updates) => {
      const fields = [];
      const values = [];
      if (updates.name !== void 0) {
        fields.push("name = ?");
        values.push(updates.name);
      }
      if (updates.color !== void 0) {
        fields.push("color = ?");
        values.push(updates.color);
      }
      if (fields.length > 0) {
        fields.push("updated_at = datetime('now')");
        values.push(id);
        db2.prepare(`UPDATE stamps SET ${fields.join(", ")} WHERE id = ?`).run(...values);
      }
      return db2.prepare("SELECT * FROM stamps WHERE id = ?").get(id);
    }
  );
  electron.ipcMain.handle(IPC.STAMPS.DELETE, (_, id) => {
    const usageCount = db2.prepare("SELECT COUNT(*) as count FROM project_stamps WHERE stamp_id = ?").get(id);
    if (usageCount.count > 0) {
      throw new Error("Cannot delete stamp that is in use by projects");
    }
    db2.prepare("DELETE FROM stamps WHERE id = ?").run(id);
    return true;
  });
}
function registerProjectHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle(IPC.PROJECTS.LIST, () => {
    return db2.prepare(
      `SELECT
          p.*,
          COUNT(ps.id) as total_stamps,
          SUM(CASE WHEN ps.status = 'completed' THEN 1 ELSE 0 END) as completed_stamps,
          (SELECT s.name FROM project_stamps ps2
           JOIN stamps s ON s.id = ps2.stamp_id
           WHERE ps2.project_id = p.id AND ps2.status = 'in_progress'
           ORDER BY ps2.sort_order ASC LIMIT 1) as current_stamp
        FROM projects p
        LEFT JOIN project_stamps ps ON ps.project_id = p.id
        WHERE p.archived_at IS NULL
        GROUP BY p.id
        ORDER BY p.sort_order ASC`
    ).all();
  });
  electron.ipcMain.handle(IPC.PROJECTS.CREATE, (_, input) => {
    const stamp_ids = input.stamp_ids ?? [];
    const projectId = nanoid();
    const maxOrder = db2.prepare("SELECT MAX(sort_order) as max FROM projects").get();
    const sort_order = (maxOrder?.max ?? 0) + 1;
    const insertProject = db2.prepare(
      "INSERT INTO projects (id, name, sort_order) VALUES (?, ?, ?)"
    );
    const insertProjectStamp = db2.prepare(
      "INSERT INTO project_stamps (id, project_id, stamp_id, sort_order) VALUES (?, ?, ?, ?)"
    );
    const transaction = db2.transaction(() => {
      insertProject.run(projectId, input.name, sort_order);
      stamp_ids.forEach((stampId, index) => {
        insertProjectStamp.run(nanoid(), projectId, stampId, index + 1);
      });
    });
    transaction();
    return db2.prepare("SELECT * FROM projects WHERE id = ?").get(projectId);
  });
  electron.ipcMain.handle(
    IPC.PROJECTS.UPDATE,
    (_, id, updates) => {
      if (updates.name !== void 0) {
        db2.prepare("UPDATE projects SET name = ?, updated_at = datetime('now') WHERE id = ?").run(
          updates.name,
          id
        );
      }
      return db2.prepare("SELECT * FROM projects WHERE id = ?").get(id);
    }
  );
  electron.ipcMain.handle(IPC.PROJECTS.DELETE, (_, id) => {
    db2.prepare("DELETE FROM projects WHERE id = ?").run(id);
    return true;
  });
  electron.ipcMain.handle(IPC.PROJECTS.ARCHIVE, (_, id) => {
    db2.prepare("UPDATE projects SET archived_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(id);
    return db2.prepare("SELECT * FROM projects WHERE id = ?").get(id);
  });
}
function registerProjectStampHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle(IPC.PROJECT_STAMPS.LIST, (_, projectId) => {
    return db2.prepare(
      `SELECT ps.*, s.name as stamp_name, s.color as stamp_color
         FROM project_stamps ps
         JOIN stamps s ON s.id = ps.stamp_id
         WHERE ps.project_id = ?
         ORDER BY ps.sort_order ASC`
    ).all(projectId);
  });
  electron.ipcMain.handle(
    IPC.PROJECT_STAMPS.ADD,
    (_, projectId, stampId) => {
      const id = nanoid();
      const maxOrder = db2.prepare("SELECT MAX(sort_order) as max FROM project_stamps WHERE project_id = ?").get(projectId);
      const sort_order = (maxOrder?.max ?? 0) + 1;
      db2.prepare(
        "INSERT INTO project_stamps (id, project_id, stamp_id, sort_order) VALUES (?, ?, ?, ?)"
      ).run(id, projectId, stampId, sort_order);
      return db2.prepare(
        `SELECT ps.*, s.name as stamp_name, s.color as stamp_color
           FROM project_stamps ps
           JOIN stamps s ON s.id = ps.stamp_id
           WHERE ps.id = ?`
      ).get(id);
    }
  );
  electron.ipcMain.handle(IPC.PROJECT_STAMPS.REMOVE, (_, id) => {
    db2.prepare("DELETE FROM project_stamps WHERE id = ?").run(id);
    return true;
  });
  electron.ipcMain.handle(IPC.PROJECT_STAMPS.SET_STATUS, (_, id, status) => {
    const completedAt = status === "completed" ? "datetime('now')" : "NULL";
    db2.prepare(
      `UPDATE project_stamps
       SET status = ?, completed_at = ${completedAt}, updated_at = datetime('now')
       WHERE id = ?`
    ).run(status, id);
    return db2.prepare(
      `SELECT ps.*, s.name as stamp_name, s.color as stamp_color
         FROM project_stamps ps
         JOIN stamps s ON s.id = ps.stamp_id
         WHERE ps.id = ?`
    ).get(id);
  });
  electron.ipcMain.handle(
    IPC.PROJECT_STAMPS.REORDER,
    (_, items) => {
      const update = db2.prepare("UPDATE project_stamps SET sort_order = ? WHERE id = ?");
      const transaction = db2.transaction(() => {
        for (const item of items) {
          update.run(item.sort_order, item.id);
        }
      });
      transaction();
      return true;
    }
  );
}
function registerCommitHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle(IPC.COMMITS.LIST, (_, projectId) => {
    return db2.prepare("SELECT * FROM commits WHERE project_id = ? ORDER BY created_at DESC").all(projectId);
  });
  electron.ipcMain.handle(IPC.COMMITS.CREATE, (_, input) => {
    const id = nanoid();
    const transaction = db2.transaction(() => {
      db2.prepare(
        "INSERT INTO commits (id, project_id, project_stamp_id, note) VALUES (?, ?, ?, ?)"
      ).run(id, input.project_id, input.project_stamp_id, input.note);
      db2.prepare(
        `UPDATE project_stamps
         SET status = 'completed', completed_at = datetime('now'), updated_at = datetime('now')
         WHERE id = ?`
      ).run(input.project_stamp_id);
    });
    transaction();
    return db2.prepare("SELECT * FROM commits WHERE id = ?").get(id);
  });
}
const WINDOW_WIDTH = 380;
const WINDOW_MAX_HEIGHT = 520;
let panelWindow = null;
function createPanelWindow() {
  panelWindow = new electron.BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_MAX_HEIGHT,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    transparent: true,
    vibrancy: "under-window",
    visualEffectState: "active",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  panelWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  panelWindow.on("blur", () => {
    hidePanelWindow();
  });
  panelWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    panelWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    panelWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  return panelWindow;
}
function togglePanelWindow(tray2) {
  if (!panelWindow) return;
  if (panelWindow.isVisible()) {
    hidePanelWindow();
  } else {
    showPanelWindow(tray2);
  }
}
function togglePanelWindowAtDefault() {
  if (!panelWindow) return;
  if (panelWindow.isVisible()) {
    hidePanelWindow();
  } else {
    showPanelWindowAtDefault();
  }
}
function showPanelWindow(tray2) {
  if (!panelWindow) return;
  const trayBounds = tray2.getBounds();
  const windowBounds = panelWindow.getBounds();
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
  const y = Math.round(trayBounds.y + trayBounds.height + 4);
  panelWindow.setPosition(x, y);
  panelWindow.show();
}
function showPanelWindowAtDefault() {
  if (!panelWindow) return;
  const { workArea } = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint());
  const windowBounds = panelWindow.getBounds();
  const x = Math.round(workArea.x + workArea.width - windowBounds.width - 8);
  const y = Math.round(workArea.y + 8);
  panelWindow.setPosition(x, y);
  panelWindow.show();
}
function hidePanelWindow() {
  if (!panelWindow) return;
  panelWindow.hide();
}
function getPanelWindow() {
  return panelWindow;
}
function registerWindowHandlers() {
  electron.ipcMain.handle(IPC.WINDOW.HIDE, () => {
    const panel = getPanelWindow();
    panel?.hide();
    return true;
  });
}
function registerAllHandlers() {
  registerStampHandlers();
  registerProjectHandlers();
  registerProjectStampHandlers();
  registerCommitHandlers();
  registerWindowHandlers();
}
let tray = null;
function createTray(onClick) {
  const iconPath = path.join(__dirname, "../../resources/iconTemplate.png");
  let icon;
  try {
    icon = electron.nativeImage.createFromPath(iconPath);
  } catch {
    icon = electron.nativeImage.createEmpty();
  }
  if (icon.isEmpty()) {
    icon = electron.nativeImage.createFromBuffer(
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAAXNSR0IArs4c6QAAAMRJREFUOBFjYBhowEgbBv7//88MxExAbATEjEDMBMT/gfg/ED8E4ntAfBeI7wDxXSC+B5IAYjYgZgViNqgYUOwBEN8F4v9QzAzFLFAxi5CQkP9lZWX/gQqYoQqZoYqYoYrAgJmZmQFoCANQjBmqiBkqDwYsUMIClGBhZmYB0ixQMRaoGBjAlDEzMzMD5VmhYqxQMTBggRIsQMzCzMwCpFmgYixQMRaoGBiwQAkWIGZhZmYB0ixQMRaoGMUAAG3wTBPMh+PTAAAAAElFTkSuQmCC",
        "base64"
      )
    );
    icon = icon.resize({ width: 18, height: 18 });
  }
  icon.setTemplateImage(true);
  tray = new electron.Tray(icon);
  tray.setToolTip("DriftLog");
  tray.on("click", onClick);
  return tray;
}
electron.app.dock?.hide();
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.driftlog.app");
  initDatabase();
  registerAllHandlers();
  const panel = createPanelWindow();
  const tray2 = createTray(() => togglePanelWindow(tray2));
  electron.globalShortcut.register("CommandOrControl+Shift+D", () => {
    togglePanelWindowAtDefault();
  });
  panel.on("ready-to-show", () => {
  });
});
electron.app.on("window-all-closed", () => {
});
electron.app.on("will-quit", () => {
  electron.globalShortcut.unregisterAll();
});
