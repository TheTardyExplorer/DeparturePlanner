export type HourCycle = '12' | '24'
export type ThemeSetting = 'system' | 'light' | 'dark'

export interface Settings {
  hourCycle: HourCycle
  theme: ThemeSetting
}

export interface TaskDef {
  id: string
  emoji: string
  name: string
  defaultMinutes: number
}

export interface PlanItem {
  id: string
  sourceId?: string
  emoji: string
  name: string
  /** The default this step was created with, kept for the "reset" affordance. */
  defaultMinutes: number
  /** Effective duration for this plan. */
  minutes: number
}

export interface Plan {
  /** "HH:mm" in 24-hour form, as required by <input type="time">. */
  arrivalTime: string
  dayOffset: 0 | 1
  items: PlanItem[]
}

export interface SavedPlan {
  id: string
  name: string
  items: PlanItem[]
  arrivalTime?: string
  dayOffset?: 0 | 1
  createdAt: number
}

export interface PersistedState {
  settings: Settings
  library: TaskDef[]
  currentPlan: Plan
  presets: SavedPlan[]
}

export interface Backup extends PersistedState {
  version: number
  exportedAt: string
}
