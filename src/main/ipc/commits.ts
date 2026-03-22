import { ipcMain } from 'electron'
import { nanoid } from 'nanoid'
import { getDatabase } from '../database'
import { IPC } from '../../shared/ipc-channels'
import type { Commit, CreateCommitInput } from '../../shared/types'

export function registerCommitHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(IPC.COMMITS.LIST, (_, projectId: string): Commit[] => {
    return db
      .prepare('SELECT * FROM commits WHERE project_id = ? ORDER BY created_at DESC')
      .all(projectId) as Commit[]
  })

  ipcMain.handle(IPC.COMMITS.CREATE, (_, input: CreateCommitInput): Commit => {
    const id = nanoid()

    const transaction = db.transaction(() => {
      db.prepare(
        'INSERT INTO commits (id, project_id, project_stamp_id, note) VALUES (?, ?, ?, ?)'
      ).run(id, input.project_id, input.project_stamp_id, input.note)

      db.prepare(
        `UPDATE project_stamps
         SET status = 'completed', completed_at = datetime('now'), updated_at = datetime('now')
         WHERE id = ?`
      ).run(input.project_stamp_id)
    })

    transaction()

    return db.prepare('SELECT * FROM commits WHERE id = ?').get(id) as Commit
  })
}
