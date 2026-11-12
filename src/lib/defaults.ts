import type { TaskDef } from './types'

export const DEFAULT_LIBRARY: TaskDef[] = [
  { id: 'lib-travel', emoji: '🚗', name: 'Travel time', defaultMinutes: 20 },
  { id: 'lib-shoes', emoji: '👟', name: 'Shoes & coat', defaultMinutes: 3 },
  { id: 'lib-snack', emoji: '🥪', name: 'Make a snack', defaultMinutes: 5 },
  { id: 'lib-water', emoji: '💧', name: 'Fill water bottle', defaultMinutes: 1 },
  { id: 'lib-bag', emoji: '🎒', name: 'Pack bag', defaultMinutes: 4 },
  { id: 'lib-keys', emoji: '🔑', name: 'Keys & wallet', defaultMinutes: 2 },
  { id: 'lib-bathroom', emoji: '🚻', name: 'Bathroom', defaultMinutes: 3 },
  { id: 'lib-teeth', emoji: '🪥', name: 'Brush teeth', defaultMinutes: 3 },
  { id: 'lib-dressed', emoji: '👕', name: 'Get dressed', defaultMinutes: 7 },
  { id: 'lib-hair', emoji: '💇', name: 'Hair', defaultMinutes: 5 },
  { id: 'lib-shower', emoji: '🚿', name: 'Shower', defaultMinutes: 15 },
  { id: 'lib-buffer', emoji: '🧘', name: 'Buffer / wiggle room', defaultMinutes: 5 },
]

export const EMOJI_CHOICES = [
  '🚗',
  '🚶',
  '🚌',
  '🚲',
  '👟',
  '🧥',
  '🎒',
  '🔑',
  '💧',
  '🥪',
  '🍎',
  '☕',
  '🚿',
  '🪥',
  '👕',
  '💇',
  '🧴',
  '🚻',
  '🐕',
  '🧘',
  '📱',
  '💊',
  '🎁',
  '🧩',
]

export const DURATION_PRESETS = [1, 3, 5, 10, 15, 20, 30, 45, 60]
