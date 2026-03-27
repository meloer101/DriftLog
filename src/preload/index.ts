import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/ipc-channels'
import type {
  Stamp,
  CreateStampInput,
  Project,
  ProjectWithProgress,
  CreateProjectInput,
  ProjectStampWithDetails,
  ProjectStampStatus,
  Commit,
  CreateCommitInput
} from '../shared/types'

const api = {
  stamps: {
    list: (): Promise<Stamp[]> => ipcRenderer.invoke(IPC.STAMPS.LIST),
    create: (input: CreateStampInput): Promise<Stamp> =>
      ipcRenderer.invoke(IPC.STAMPS.CREATE, input),
    update: (id: string, updates: Partial<Pick<Stamp, 'name' | 'color'>>): Promise<Stamp> =>
      ipcRenderer.invoke(IPC.STAMPS.UPDATE, id, updates),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke(IPC.STAMPS.DELETE, id)
  },
  projects: {
    list: (): Promise<ProjectWithProgress[]> => ipcRenderer.invoke(IPC.PROJECTS.LIST),
    create: (input: CreateProjectInput): Promise<Project> =>
      ipcRenderer.invoke(IPC.PROJECTS.CREATE, input),
    update: (id: string, updates: Partial<Pick<Project, 'name'>>): Promise<Project> =>
      ipcRenderer.invoke(IPC.PROJECTS.UPDATE, id, updates),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke(IPC.PROJECTS.DELETE, id),
    archive: (id: string): Promise<Project> => ipcRenderer.invoke(IPC.PROJECTS.ARCHIVE, id)
  },
  projectStamps: {
    list: (projectId: string): Promise<ProjectStampWithDetails[]> =>
      ipcRenderer.invoke(IPC.PROJECT_STAMPS.LIST, projectId),
    add: (projectId: string, stampId: string): Promise<ProjectStampWithDetails> =>
      ipcRenderer.invoke(IPC.PROJECT_STAMPS.ADD, projectId, stampId),
    remove: (id: string): Promise<boolean> => ipcRenderer.invoke(IPC.PROJECT_STAMPS.REMOVE, id),
    setStatus: (id: string, status: ProjectStampStatus): Promise<ProjectStampWithDetails> =>
      ipcRenderer.invoke(IPC.PROJECT_STAMPS.SET_STATUS, id, status),
    reorder: (items: { id: string; sort_order: number }[]): Promise<boolean> =>
      ipcRenderer.invoke(IPC.PROJECT_STAMPS.REORDER, items)
  },
  commits: {
    list: (projectId: string): Promise<Commit[]> =>
      ipcRenderer.invoke(IPC.COMMITS.LIST, projectId),
    create: (input: CreateCommitInput): Promise<Commit> =>
      ipcRenderer.invoke(IPC.COMMITS.CREATE, input)
  },
  window: {
    hide: (): Promise<boolean> => ipcRenderer.invoke(IPC.WINDOW.HIDE),
    openDesktop: (): Promise<boolean> => ipcRenderer.invoke(IPC.WINDOW.OPEN_DESKTOP)
  }
}

contextBridge.exposeInMainWorld('api', api)

export type DriftLogAPI = typeof api
