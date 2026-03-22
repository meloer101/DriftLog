import { create } from 'zustand'
import type {
  ProjectWithProgress,
  CreateProjectInput,
  ProjectStampWithDetails,
  CreateCommitInput,
  Commit
} from '../../shared/types'

interface ProjectStore {
  projectMap: Record<string, ProjectWithProgress>
  projectStampsMap: Record<string, ProjectStampWithDetails[]>
  loading: boolean

  projects: () => ProjectWithProgress[]
  fetchProjects: () => Promise<void>
  createProject: (input: CreateProjectInput) => Promise<void>
  updateProject: (id: string, updates: { name: string }) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  archiveProject: (id: string) => Promise<void>

  fetchProjectStamps: (projectId: string) => Promise<void>
  addStampToProject: (projectId: string, stampId: string) => Promise<void>
  removeStampFromProject: (id: string, projectId: string) => Promise<void>
  reorderProjectStamps: (projectId: string, orderedProjectStampIds: string[]) => Promise<void>

  completeStamp: (input: CreateCommitInput) => Promise<Commit>
  setStampStatus: (
    id: string,
    projectId: string,
    status: 'pending' | 'in_progress' | 'completed'
  ) => Promise<void>
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projectMap: {},
  projectStampsMap: {},
  loading: false,

  projects: () => {
    const map = get().projectMap
    return Object.values(map).sort((a, b) => a.sort_order - b.sort_order)
  },

  fetchProjects: async () => {
    set({ loading: true })
    const projects = await window.api.projects.list()
    const map: Record<string, ProjectWithProgress> = {}
    projects.forEach((p) => {
      map[p.id] = p
    })
    set({ projectMap: map, loading: false })
  },

  createProject: async (input) => {
    await window.api.projects.create(input)
    await get().fetchProjects()
  },

  updateProject: async (id, updates) => {
    await window.api.projects.update(id, updates)
    await get().fetchProjects()
  },

  deleteProject: async (id) => {
    const { [id]: _, ...rest } = get().projectMap
    set({ projectMap: rest })
    await window.api.projects.delete(id)
  },

  archiveProject: async (id) => {
    await window.api.projects.archive(id)
    const { [id]: _, ...rest } = get().projectMap
    set({ projectMap: rest })
  },

  fetchProjectStamps: async (projectId) => {
    const stamps = await window.api.projectStamps.list(projectId)
    set((state) => ({
      projectStampsMap: { ...state.projectStampsMap, [projectId]: stamps }
    }))
  },

  addStampToProject: async (projectId, stampId) => {
    await window.api.projectStamps.add(projectId, stampId)
    await get().fetchProjectStamps(projectId)
    await get().fetchProjects()
  },

  removeStampFromProject: async (id, projectId) => {
    await window.api.projectStamps.remove(id)
    await get().fetchProjectStamps(projectId)
    await get().fetchProjects()
  },

  reorderProjectStamps: async (projectId, orderedProjectStampIds) => {
    const items = orderedProjectStampIds.map((id, index) => ({
      id,
      sort_order: index + 1
    }))
    await window.api.projectStamps.reorder(items)
    await get().fetchProjectStamps(projectId)
    await get().fetchProjects()
  },

  completeStamp: async (input) => {
    const commit = await window.api.commits.create(input)
    await get().fetchProjectStamps(input.project_id)
    await get().fetchProjects()
    return commit
  },

  setStampStatus: async (id, projectId, status) => {
    await window.api.projectStamps.setStatus(id, status)
    await get().fetchProjectStamps(projectId)
    await get().fetchProjects()
  }
}))
