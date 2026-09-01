import type { AppData, LogEvent, Sin } from './types'

export const STORAGE_KEY = 'sinner:data:v1'
export const emptyData = (): AppData => ({ version: 1, sins: [], events: [], settings: { weekStart: 1 } })

const validData = (value: unknown): value is AppData => {
  if (!value || typeof value !== 'object') return false
  const data = value as Partial<AppData>
  return data.version === 1 && Array.isArray(data.sins) && Array.isArray(data.events) && !!data.settings && (data.settings.weekStart === 0 || data.settings.weekStart === 1)
}

export const store = {
  load(): AppData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return emptyData()
      const parsed: unknown = JSON.parse(raw)
      return validData(parsed) ? parsed : emptyData()
    } catch { return emptyData() }
  },
  save(data: AppData) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) },
  export(data: AppData) { return JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2) },
  import(raw: string): AppData {
    const parsed: unknown = JSON.parse(raw)
    if (!validData(parsed)) throw new Error('This does not appear to be a Sinner export.')
    return parsed
  },
}

export const makeId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
const icons = ['spark', 'smoke', 'eye', 'bolt', 'moon', 'flame', 'mouth', 'spiral']
const colors = ['#ff6b55', '#9b79ff', '#4dd9df', '#65dfa1', '#ff79b8', '#ffd05c']
export const makeSin = (name: string, definition: string, weeklyLimit: number, index: number): Sin => ({
  id: makeId(), name: name.trim(), definition: definition.trim(), weeklyLimit, icon: icons[index % icons.length], color: colors[index % colors.length], createdAt: new Date().toISOString(), archived: false,
})
export const makeEvent = (sinId: string): LogEvent => ({ id: makeId(), sinId, occurredAt: new Date().toISOString() })
