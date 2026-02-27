export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  text: string
  completed: boolean
  description?: string
  deadline?: string
  priority: TaskPriority
  category: string
}

export const TASKS_STORAGE_KEY = 'personal-dashboard:tasks'

export const TASK_CATEGORIES_STORAGE_KEY =
  'personal-dashboard:task-categories'

const DEFAULT_CATEGORIES: string[] = ['General', 'Learning', 'Work', 'Personal']

export const getTaskPriorityBadgeClasses = (priority: TaskPriority): string => {
  if (priority === 'high') {
    return 'border-rose-400/70 bg-rose-500/15 text-rose-200'
  }
  if (priority === 'medium') {
    return 'border-amber-400/70 bg-amber-500/15 text-amber-200'
  }
  return 'border-sky-400/70 bg-sky-500/15 text-sky-200'
}

export const loadTaskCategories = (): string[] => {
  if (typeof window === 'undefined') {
    return DEFAULT_CATEGORIES
  }
  try {
    const raw = window.localStorage.getItem(TASK_CATEGORIES_STORAGE_KEY)
    if (!raw) {
      return DEFAULT_CATEGORIES
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return DEFAULT_CATEGORIES
    }
    const cleaned = parsed
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter((value) => value.length > 0)

    return cleaned.length > 0 ? cleaned : DEFAULT_CATEGORIES
  } catch {
    return DEFAULT_CATEGORIES
  }
}

export const persistTaskCategories = (categories: string[]): void => {
  try {
    window.localStorage.setItem(
      TASK_CATEGORIES_STORAGE_KEY,
      JSON.stringify(categories),
    )
  } catch {
    // If persistence fails we still rely on in-memory categories.
  }
}


