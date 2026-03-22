import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

let db: Database.Database

const CURRENT_VERSION = 1

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
`

function getDbVersion(): number {
  try {
    const row = db.prepare('SELECT MAX(version) as version FROM schema_version').get() as
      | { version: number }
      | undefined
    return row?.version ?? 0
  } catch {
    return 0
  }
}

function migrate(): void {
  const version = getDbVersion()

  if (version < 1) {
    db.exec(SCHEMA_V1)
    db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(CURRENT_VERSION)
  }

  // Future migrations:
  // if (version < 2) { db.exec(SCHEMA_V2); ... }
}

export function initDatabase(): Database.Database {
  const dbPath = join(app.getPath('userData'), 'driftlog.db')
  db = new Database(dbPath)

  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  migrate()

  return db
}

export function getDatabase(): Database.Database {
  if (!db) throw new Error('Database not initialized')
  return db
}
