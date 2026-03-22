import { create } from 'zustand'

type View = 'projects' | 'stamps' | 'create-project' | 'create-stamp'

interface UIStore {
  view: View
  expandedProjectId: string | null
  completingStampId: string | null

  setView: (view: View) => void
  toggleProject: (id: string) => void
  setCompletingStamp: (id: string | null) => void
  goBack: () => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  view: 'projects',
  expandedProjectId: null,
  completingStampId: null,

  setView: (view) => set({ view }),

  toggleProject: (id) => {
    const current = get().expandedProjectId
    set({ expandedProjectId: current === id ? null : id })
  },

  setCompletingStamp: (id) => set({ completingStampId: id }),

  goBack: () => set({ view: 'projects', completingStampId: null })
}))
