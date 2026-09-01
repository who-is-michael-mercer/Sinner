export type WeekStart = 0 | 1

export interface Sin {
  id: string
  name: string
  definition: string
  weeklyLimit: number
  icon: string
  color: string
  createdAt: string
  archived: boolean
}

export interface LogEvent {
  id: string
  sinId: string
  occurredAt: string
}

export interface AppData {
  version: 1
  sins: Sin[]
  events: LogEvent[]
  settings: { weekStart: WeekStart }
}
