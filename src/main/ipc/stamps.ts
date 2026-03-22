import { ipcMain } from 'electron'
import { nanoid } from 'nanoid'
import { getDatabase } from '../database'
import { IPC } from '../../shared/ipc-channels'
import type { Stamp, CreateStampInput } from '../../shared/types'

export function registerStampHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(IPC.STAMPS.LIST, (): Stamp[] => {
    return db.prepare('SELECT * FROM stamps ORDER BY sort_order ASC').all() as Stamp[]
  })

  ipcMain.handle(IPC.STAMPS.CREATE, (_, input: CreateStampInput): Stamp => {
    const id = nanoid()
    const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM stamps').get() as {
      max: number | null
    }
    const sort_order = (maxOrder?.max ?? 0) + 1

    db.prepare('INSERT INTO stamps (id, name, color, sort_order) VALUES (?, ?, ?, ?)').run(
      id,
      input.name,
      input.color,
      sort_order
    )

    return db.prepare('SELECT * FROM stamps WHERE id = ?').get(id) as Stamp
  })

  ipcMain.handle(
    IPC.STAMPS.UPDATE,
    (_, id: string, updates: Partial<Pick<Stamp, 'name' | 'color'>>): Stamp => {
      const fields: string[] = []
      const values: unknown[] = []

      if (updates.name !== undefined) {
        fields.push('name = ?')
        values.push(updates.name)
      }
      if (updates.color !== undefined) {
        fields.push('color = ?')
        values.push(updates.color)
      }

      if (fields.length > 0) {
        fields.push("updated_at = datetime('now')")
        values.push(id)
        db.prepare(`UPDATE stamps SET ${fields.join(', ')} WHERE id = ?`).run(...values)
      }

      return db.prepare('SELECT * FROM stamps WHERE id = ?').get(id) as Stamp
    }
  )

  ipcMain.handle(IPC.STAMPS.DELETE, (_, id: string): boolean => {
    const usageCount = db
      .prepare('SELECT COUNT(*) as count FROM project_stamps WHERE stamp_id = ?')
      .get(id) as { count: number }

    if (usageCount.count > 0) {
      throw new Error('Cannot delete stamp that is in use by projects')
    }

    db.prepare('DELETE FROM stamps WHERE id = ?').run(id)
    return true
  })
}
