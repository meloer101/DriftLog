export interface Stamp {
  id: string
  name: string
  color: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  archived_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type ProjectStampStatus = 'pending' | 'in_progress' | 'completed'

export interface ProjectStamp {
  id: string
  project_id: string
  stamp_id: string
  status: ProjectStampStatus
  sort_order: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface ProjectStampWithDetails extends ProjectStamp {
  stamp_name: string
  stamp_color: string
}

export interface Commit {
  id: string
  project_id: string
  project_stamp_id: string
  note: string
  created_at: string
}

export interface ProjectWithProgress extends Project {
  total_stamps: number
  completed_stamps: number
  current_stamp: string | null
}

export type CreateStampInput = Pick<Stamp, 'name' | 'color'>
export type CreateProjectInput = Pick<Project, 'name'> & { stamp_ids: string[] }
export type CreateCommitInput = Pick<Commit, 'project_stamp_id' | 'project_id' | 'note'>
