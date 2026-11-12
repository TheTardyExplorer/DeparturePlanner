import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_LIBRARY } from './defaults'
import { clampMinutes, defaultArrival, parseTimeValue } from './time'
import type {
  Backup,
  PersistedState,
  Plan,
  PlanItem,
  SavedPlan,
  Settings,
  TaskDef,
} from './types'

const STORAGE_KEY = 'departure-planner'
const MAX_ITEMS = 500

export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function freshPlan(): Plan {
  const arrival = defaultArrival()
  return { ...arrival, items: [] }
}

function itemFromTask(task: TaskDef): PlanItem {
  return {
    id: uid(),
    sourceId: task.id,
    emoji: task.emoji,
    name: task.name,
    defaultMinutes: task.defaultMinutes,
    minutes: task.defaultMinutes,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isSettings(value: unknown): value is Settings {
  if (!isRecord(value)) return false
  return (
    (value.hourCycle === '12' || value.hourCycle === '24') &&
    (value.theme === 'system' || value.theme === 'light' || value.theme === 'dark')
  )
}

function isTaskDef(value: unknown): value is TaskDef {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.emoji === 'string' &&
    typeof value.name === 'string' &&
    typeof value.defaultMinutes === 'number'
  )
}

function isPlanItem(value: unknown): value is PlanItem {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.emoji === 'string' &&
    typeof value.name === 'string' &&
    typeof value.defaultMinutes === 'number' &&
    typeof value.minutes === 'number' &&
    (value.sourceId === undefined || typeof value.sourceId === 'string')
  )
}

function isPlan(value: unknown): value is Plan {
  return (
    isRecord(value) &&
    typeof value.arrivalTime === 'string' &&
    parseTimeValue(value.arrivalTime) !== null &&
    (value.dayOffset === 0 || value.dayOffset === 1) &&
    Array.isArray(value.items) &&
    value.items.every(isPlanItem)
  )
}

function isSavedPlan(value: unknown): value is SavedPlan {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.items) &&
    value.items.every(isPlanItem) &&
    (value.arrivalTime === undefined ||
      (typeof value.arrivalTime === 'string' && parseTimeValue(value.arrivalTime) !== null)) &&
    (value.dayOffset === undefined || value.dayOffset === 0 || value.dayOffset === 1)
  )
}

function normalizeItems(items: PlanItem[]): PlanItem[] {
  return items.slice(0, MAX_ITEMS).map((item) => ({
    id: item.id || uid(),
    sourceId: typeof item.sourceId === 'string' ? item.sourceId : undefined,
    emoji: item.emoji || '✅',
    name: item.name.trim() || 'Untitled step',
    defaultMinutes: clampMinutes(item.defaultMinutes),
    minutes: clampMinutes(item.minutes),
  }))
}

function normalizePlan(plan: Plan): Plan {
  return {
    arrivalTime: parseTimeValue(plan.arrivalTime) ? plan.arrivalTime : '09:00',
    dayOffset: plan.dayOffset === 1 ? 1 : 0,
    items: normalizeItems(plan.items),
  }
}

interface AppState extends PersistedState {
  addPlanItem: (task: TaskDef) => void
  addCustomPlanTask: (emoji: string, name: string, minutes: number, saveToLibrary: boolean) => void
  removePlanItem: (id: string) => { item: PlanItem; index: number } | null
  insertPlanItem: (item: PlanItem, index: number) => void
  reorderPlanItems: (activeId: string, overId: string) => void
  setPlanItemMinutes: (id: string, minutes: number) => void
  resetPlanItemDuration: (id: string) => void
  setArrivalTime: (value: string) => void
  setDayOffset: (value: 0 | 1) => void
  setPlan: (plan: Plan) => void

  createLibraryTask: (emoji: string, name: string, minutes: number) => TaskDef
  updateLibraryTask: (
    id: string,
    patch: Partial<Pick<TaskDef, 'emoji' | 'name' | 'defaultMinutes'>>,
  ) => void
  removeLibraryTask: (id: string) => { task: TaskDef; index: number } | null
  insertLibraryTask: (task: TaskDef, index: number) => void
  restoreDefaultLibrary: () => void

  savePreset: (name: string, includeArrival: boolean) => SavedPlan
  loadPreset: (id: string) => Plan | null
  deletePreset: (id: string) => SavedPlan | null
  restorePreset: (preset: SavedPlan) => void
  renamePreset: (id: string, name: string) => void

  setSettings: (patch: Partial<Settings>) => void
  getBackup: () => Backup
  importBackup: (data: unknown) => boolean
  resetAll: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: { hourCycle: '12', theme: 'system' },
      library: DEFAULT_LIBRARY.map((task) => ({ ...task })),
      currentPlan: freshPlan(),
      presets: [],

      addPlanItem: (task) =>
        set((state) => ({
          currentPlan: {
            ...state.currentPlan,
            // New steps stack backwards from arrival, matching how people plan.
            items: [itemFromTask(task), ...state.currentPlan.items],
          },
        })),

      addCustomPlanTask: (emoji, name, minutes, saveToLibrary) => {
        const task: TaskDef = {
          id: uid(),
          emoji: emoji || '✅',
          name: name.trim() || 'Untitled step',
          defaultMinutes: clampMinutes(minutes),
        }
        set((state) => ({
          library: saveToLibrary ? [...state.library, task] : state.library,
          currentPlan: {
            ...state.currentPlan,
            items: [itemFromTask(task), ...state.currentPlan.items],
          },
        }))
      },

      removePlanItem: (id) => {
        const { currentPlan } = get()
        const index = currentPlan.items.findIndex((item) => item.id === id)
        if (index === -1) return null
        const item = currentPlan.items[index]
        set({
          currentPlan: {
            ...currentPlan,
            items: currentPlan.items.filter((entry) => entry.id !== id),
          },
        })
        return { item, index }
      },

      insertPlanItem: (item, index) =>
        set((state) => {
          const items = [...state.currentPlan.items]
          items.splice(Math.max(0, Math.min(index, items.length)), 0, item)
          return { currentPlan: { ...state.currentPlan, items } }
        }),

      reorderPlanItems: (activeId, overId) =>
        set((state) => {
          if (activeId === overId) return state
          const items = [...state.currentPlan.items]
          const oldIndex = items.findIndex((item) => item.id === activeId)
          const newIndex = items.findIndex((item) => item.id === overId)
          if (oldIndex === -1 || newIndex === -1) return state
          const [moved] = items.splice(oldIndex, 1)
          items.splice(newIndex, 0, moved)
          return { currentPlan: { ...state.currentPlan, items } }
        }),

      setPlanItemMinutes: (id, minutes) =>
        set((state) => ({
          currentPlan: {
            ...state.currentPlan,
            items: state.currentPlan.items.map((item) =>
              item.id === id ? { ...item, minutes: clampMinutes(minutes) } : item,
            ),
          },
        })),

      resetPlanItemDuration: (id) =>
        set((state) => ({
          currentPlan: {
            ...state.currentPlan,
            items: state.currentPlan.items.map((item) =>
              item.id === id ? { ...item, minutes: item.defaultMinutes } : item,
            ),
          },
        })),

      setArrivalTime: (value) => {
        if (!parseTimeValue(value)) return
        set((state) => ({
          currentPlan: { ...state.currentPlan, arrivalTime: value },
        }))
      },

      setDayOffset: (value) =>
        set((state) => ({
          currentPlan: { ...state.currentPlan, dayOffset: value },
        })),

      setPlan: (plan) => set({ currentPlan: normalizePlan(plan) }),

      createLibraryTask: (emoji, name, minutes) => {
        const task: TaskDef = {
          id: uid(),
          emoji: emoji || '✅',
          name: name.trim() || 'Untitled step',
          defaultMinutes: clampMinutes(minutes),
        }
        set((state) => ({ library: [...state.library, task] }))
        return task
      },

      updateLibraryTask: (id, patch) =>
        set((state) => ({
          library: state.library.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...patch,
                  defaultMinutes:
                    patch.defaultMinutes === undefined
                      ? task.defaultMinutes
                      : clampMinutes(patch.defaultMinutes),
                }
              : task,
          ),
        })),

      removeLibraryTask: (id) => {
        const { library } = get()
        const index = library.findIndex((task) => task.id === id)
        if (index === -1) return null
        const task = library[index]
        set({ library: library.filter((entry) => entry.id !== id) })
        return { task, index }
      },

      insertLibraryTask: (task, index) =>
        set((state) => {
          const library = [...state.library]
          library.splice(Math.max(0, Math.min(index, library.length)), 0, task)
          return { library }
        }),

      restoreDefaultLibrary: () =>
        set({ library: DEFAULT_LIBRARY.map((task) => ({ ...task })) }),

      savePreset: (name, includeArrival) => {
        const { currentPlan } = get()
        const preset: SavedPlan = {
          id: uid(),
          name: name.trim() || 'Untitled plan',
          items: currentPlan.items.map((item) => ({ ...item })),
          createdAt: Date.now(),
          ...(includeArrival
            ? { arrivalTime: currentPlan.arrivalTime, dayOffset: currentPlan.dayOffset }
            : {}),
        }
        set((state) => ({ presets: [preset, ...state.presets] }))
        return preset
      },

      loadPreset: (id) => {
        const preset = get().presets.find((entry) => entry.id === id)
        if (!preset) return null
        const previous = get().currentPlan
        set((state) => ({
          currentPlan: {
            arrivalTime: preset.arrivalTime ?? state.currentPlan.arrivalTime,
            dayOffset: preset.dayOffset ?? state.currentPlan.dayOffset,
            items: preset.items.map((item) => ({ ...item, id: uid() })),
          },
        }))
        return previous
      },

      deletePreset: (id) => {
        const preset = get().presets.find((entry) => entry.id === id)
        if (!preset) return null
        set((state) => ({ presets: state.presets.filter((entry) => entry.id !== id) }))
        return preset
      },

      restorePreset: (preset) =>
        set((state) => ({ presets: [preset, ...state.presets.filter((p) => p.id !== preset.id)] })),

      renamePreset: (id, name) =>
        set((state) => ({
          presets: state.presets.map((preset) =>
            preset.id === id ? { ...preset, name: name.trim() || preset.name } : preset,
          ),
        })),

      setSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),

      getBackup: () => {
        const { settings, library, currentPlan, presets } = get()
        return {
          version: 1,
          exportedAt: new Date().toISOString(),
          settings,
          library,
          currentPlan,
          presets,
        }
      },

      importBackup: (data) => {
        if (!isRecord(data)) return false
        const { settings, library, currentPlan, presets } = data
        if (
          !isSettings(settings) ||
          !Array.isArray(library) ||
          !library.every(isTaskDef) ||
          !isPlan(currentPlan) ||
          !Array.isArray(presets) ||
          !presets.every(isSavedPlan)
        ) {
          return false
        }
        set({
          settings,
          library: library.map((task) => ({
            ...task,
            defaultMinutes: clampMinutes(task.defaultMinutes),
          })),
          currentPlan: normalizePlan(currentPlan),
          presets: presets.map((preset) => ({
            ...preset,
            items: normalizeItems(preset.items),
          })),
        })
        return true
      },

      resetAll: () =>
        set({
          settings: { hourCycle: '12', theme: 'system' },
          library: DEFAULT_LIBRARY.map((task) => ({ ...task })),
          currentPlan: freshPlan(),
          presets: [],
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      partialize: (state) => ({
        settings: state.settings,
        library: state.library,
        currentPlan: state.currentPlan,
        presets: state.presets,
      }),
      migrate: (persisted, version) => {
        const state = persisted as PersistedState
        // v2 retired two starter tasks; drop them from saved libraries but leave
        // them alone inside plans people already built.
        if (version < 2 && Array.isArray(state.library)) {
          const retired = new Set(['lib-coffee', 'lib-dog'])
          state.library = state.library.filter((task) => !retired.has(task.id))
        }
        return state
      },
    },
  ),
)

export type { AppState }
