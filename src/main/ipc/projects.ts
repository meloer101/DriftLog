import { ipcMain } from 'electron'
import { nanoid } from 'nanoid'
import { getDatabase } from '../database'
import { IPC } from '../../shared/ipc-channels'
import type { Project, ProjectWithProgress, CreateProjectInput } from '../../shared/types'

export function registerProjectHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(IPC.PROJECTS.LIST, (): ProjectWithProgress[] => {
    return db
      .prepare(
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
      )
      .all() as ProjectWithProgress[]
  })

  ipcMain.handle(IPC.PROJECTS.CREATE, (_, input: CreateProjectInput): Project => {
    const stamp_ids = input.stamp_ids ?? []

    const projectId = nanoid()
    const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM projects').get() as {
      max: number | null
    }
    const sort_order = (maxOrder?.max ?? 0) + 1

    const insertProject = db.prepare(
      'INSERT INTO projects (id, name, sort_order) VALUES (?, ?, ?)'
    )
    const insertProjectStamp = db.prepare(
      'INSERT INTO project_stamps (id, project_id, stamp_id, sort_order) VALUES (?, ?, ?, ?)'
    )

    const transaction = db.transaction(() => {
      insertProject.run(projectId, input.name, sort_order)

      stamp_ids.forEach((stampId, index) => {
        insertProjectStamp.run(nanoid(), projectId, stampId, index + 1)
      })
    })

    transaction()

    return db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as Project
  })

  ipcMain.handle(
    IPC.PROJECTS.UPDATE,
    (_, id: string, updates: Partial<Pick<Project, 'name'>>): Project => {
      if (updates.name !== undefined) {
        db.prepare("UPDATE projects SET name = ?, updated_at = datetime('now') WHERE id = ?").run(
          updates.name,
          id
        )
      }
      return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project
    }
  )

  ipcMain.handle(IPC.PROJECTS.DELETE, (_, id: string): boolean => {
    db.prepare('DELETE FROM projects WHERE id = ?').run(id)
    return true
  })

  ipcMain.handle(IPC.PROJECTS.ARCHIVE, (_, id: string): Project => {
    db.prepare("UPDATE projects SET archived_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(id)
    return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project
  })
}
