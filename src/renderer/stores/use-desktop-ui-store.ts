import { create } from 'zustand'

type DesktopView = 'all-projects' | 'project-detail' | 'stamps'

interface DesktopUIStore {
  view: DesktopView
  selectedProjectId: string | null
  completingStampId: string | null

  setView: (view: DesktopView) => void
  selectProject: (id: string) => void
  setCompletingStamp: (id: string | null) => void
  goBack: () => void
}

export const useDesktopUIStore = create<DesktopUIStore>((set) => ({
  view: 'all-projects',
  selectedProjectId: null,
  completingStampId: null,

  setView: (view) => set({ view }),

  selectProject: (id) => set({ view: 'project-detail', selectedProjectId: id }),

  setCompletingStamp: (id) => set({ completingStampId: id }),

  goBack: () => set({ view: 'all-projects', selectedProjectId: null, completingStampId: null })
}))
