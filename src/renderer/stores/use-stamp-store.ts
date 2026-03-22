import { create } from 'zustand'
import type { Stamp, CreateStampInput } from '../../shared/types'

interface StampStore {
  stampMap: Record<string, Stamp>
  loading: boolean
  stamps: () => Stamp[]
  fetchStamps: () => Promise<void>
  createStamp: (input: CreateStampInput) => Promise<Stamp>
  updateStamp: (id: string, updates: Partial<Pick<Stamp, 'name' | 'color'>>) => Promise<void>
  deleteStamp: (id: string) => Promise<void>
}

export const useStampStore = create<StampStore>((set, get) => ({
  stampMap: {},
  loading: false,

  stamps: () => {
    const map = get().stampMap
    return Object.values(map).sort((a, b) => a.sort_order - b.sort_order)
  },

  fetchStamps: async () => {
    set({ loading: true })
    const stamps = await window.api.stamps.list()
    const map: Record<string, Stamp> = {}
    stamps.forEach((s) => {
      map[s.id] = s
    })
    set({ stampMap: map, loading: false })
  },

  createStamp: async (input) => {
    const stamp = await window.api.stamps.create(input)
    set((state) => ({ stampMap: { ...state.stampMap, [stamp.id]: stamp } }))
    return stamp
  },

  updateStamp: async (id, updates) => {
    const prev = get().stampMap[id]
    if (!prev) return

    set((state) => ({
      stampMap: { ...state.stampMap, [id]: { ...prev, ...updates } }
    }))

    try {
      const updated = await window.api.stamps.update(id, updates)
      set((state) => ({ stampMap: { ...state.stampMap, [id]: updated } }))
    } catch {
      set((state) => ({ stampMap: { ...state.stampMap, [id]: prev } }))
    }
  },

  deleteStamp: async (id) => {
    const prev = get().stampMap[id]
    const { [id]: _, ...rest } = get().stampMap
    set({ stampMap: rest })

    try {
      await window.api.stamps.delete(id)
    } catch {
      if (prev) set((state) => ({ stampMap: { ...state.stampMap, [id]: prev } }))
    }
  }
}))
