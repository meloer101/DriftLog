import { ipcMain } from 'electron'
import { nanoid } from 'nanoid'
import { getDatabase } from '../database'
import { IPC } from '../../shared/ipc-channels'
import type { ProjectStampWithDetails, ProjectStampStatus } from '../../shared/types'

export function registerProjectStampHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(IPC.PROJECT_STAMPS.LIST, (_, projectId: string): ProjectStampWithDetails[] => {
    return db
      .prepare(
        `SELECT ps.*, s.name as stamp_name, s.color as stamp_color
         FROM project_stamps ps
         JOIN stamps s ON s.id = ps.stamp_id
         WHERE ps.project_id = ?
         ORDER BY ps.sort_order ASC`
      )
      .all(projectId) as ProjectStampWithDetails[]
  })

  ipcMain.handle(
    IPC.PROJECT_STAMPS.ADD,
    (_, projectId: string, stampId: string): ProjectStampWithDetails => {
      const id = nanoid()
      const maxOrder = db
        .prepare('SELECT MAX(sort_order) as max FROM project_stamps WHERE project_id = ?')
        .get(projectId) as { max: number | null }
      const sort_order = (maxOrder?.max ?? 0) + 1

      db.prepare(
        'INSERT INTO project_stamps (id, project_id, stamp_id, sort_order) VALUES (?, ?, ?, ?)'
      ).run(id, projectId, stampId, sort_order)

      return db
        .prepare(
          `SELECT ps.*, s.name as stamp_name, s.color as stamp_color
           FROM project_stamps ps
           JOIN stamps s ON s.id = ps.stamp_id
           WHERE ps.id = ?`
        )
        .get(id) as ProjectStampWithDetails
    }
  )

  ipcMain.handle(IPC.PROJECT_STAMPS.REMOVE, (_, id: string): boolean => {
    db.prepare('DELETE FROM project_stamps WHERE id = ?').run(id)
    return true
  })

  ipcMain.handle(IPC.PROJECT_STAMPS.SET_STATUS, (_, id: string, status: ProjectStampStatus) => {
    const completedAt = status === 'completed' ? "datetime('now')" : 'NULL'
    db.prepare(
      `UPDATE project_stamps
       SET status = ?, completed_at = ${completedAt}, updated_at = datetime('now')
       WHERE id = ?`
    ).run(status, id)

    return db
      .prepare(
        `SELECT ps.*, s.name as stamp_name, s.color as stamp_color
         FROM project_stamps ps
         JOIN stamps s ON s.id = ps.stamp_id
         WHERE ps.id = ?`
      )
      .get(id) as ProjectStampWithDetails
  })

  ipcMain.handle(
    IPC.PROJECT_STAMPS.REORDER,
    (_, items: { id: string; sort_order: number }[]): boolean => {
      const update = db.prepare('UPDATE project_stamps SET sort_order = ? WHERE id = ?')
      const transaction = db.transaction(() => {
        for (const item of items) {
          update.run(item.sort_order, item.id)
        }
      })
      transaction()
      return true
    }
  )
}
