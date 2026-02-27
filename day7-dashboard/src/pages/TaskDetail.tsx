import { useRef, useState, type FC, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  TASKS_STORAGE_KEY,
  TASK_CATEGORIES_STORAGE_KEY,
  getTaskPriorityBadgeClasses,
  type Task,
  type TaskPriority,
} from './taskModel'

// We read tasks from localStorage on first render so the detail view stays
// consistent with the main list even after a full page refresh or deep link.
const TaskDetail: FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === 'undefined') {
      return []
    }
    try {
      const raw = window.localStorage.getItem(TASKS_STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) return []
      return parsed.map((item) => {
        const priority: TaskPriority =
          item.priority === 'high' || item.priority === 'low'
            ? item.priority
            : 'medium'
        return {
          ...item,
          description: typeof item.description === 'string' ? item.description : '',
          deadline: typeof item.deadline === 'string' ? item.deadline : '',
          priority,
        } as Task
      })
    } catch {
      return []
    }
  })

  const index = id != null ? Number.parseInt(id, 10) - 1 : -1
  const task =
    Number.isNaN(index) || index < 0 || index >= tasks.length
      ? undefined
      : tasks[index]

  const [description, setDescription] = useState<string>(
    task?.description ?? '',
  )
  const [deadline, setDeadline] = useState<string>(task?.deadline ?? '')
  const [hasOpenedDeadline, setHasOpenedDeadline] = useState<boolean>(false)
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? 'medium',
  )
  const deadlineInputRef = useRef<HTMLInputElement | null>(null)
  const [categories, setCategories] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return ['General', 'Learning', 'Work', 'Personal']
    }
    try {
      const raw = window.localStorage.getItem(TASK_CATEGORIES_STORAGE_KEY)
      if (!raw) {
        return ['General', 'Learning', 'Work', 'Personal']
      }
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) {
        return ['General', 'Learning', 'Work', 'Personal']
      }
      const cleaned = parsed
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter((value) => value.length > 0)
      const fromTasks = task?.category ? [task.category] : []
      const merged = Array.from(new Set([...cleaned, ...fromTasks]))
      return merged.length > 0
        ? merged
        : ['General', 'Learning', 'Work', 'Personal']
    } catch {
      return ['General', 'Learning', 'Work', 'Personal']
    }
  })
  const [category, setCategory] = useState<string>(task?.category ?? 'General')
  const [newCategoryInput, setNewCategoryInput] = useState<string>('')

  const statusLabel = task?.completed ? 'Completed' : 'Pending'

  const handleDeadlineFocus = (): void => {
    if (hasOpenedDeadline || deadline !== '') {
      return
    }
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setDeadline(tomorrow.toISOString().slice(0, 10))
    setHasOpenedDeadline(true)
  }

  const handleDeadlineHover = (): void => {
    handleDeadlineFocus()
    const input = deadlineInputRef.current as
      | (HTMLInputElement & { showPicker?: () => void })
      | null
    if (!input) return
    input.focus()
    input.showPicker?.()
  }

  const handleSave = (event: FormEvent): void => {
    event.preventDefault()
    if (!task || Number.isNaN(index) || index < 0) {
      return
    }

    const updatedTasks = tasks.map((existing, existingIndex) =>
      existingIndex === index
        ? {
            ...existing,
            description,
            deadline,
            priority,
            category,
          }
        : existing,
    )

    setTasks(updatedTasks)
    try {
      window.localStorage.setItem(
        TASKS_STORAGE_KEY,
        JSON.stringify(updatedTasks),
      )
    } catch {
      // If persistence fails we still keep the in-memory update.
    }

    navigate('/tasks')
  }

  return (
    <main className="space-y-6 md:space-y-8">
      <section className="rounded-xl border border-gray-700/60 bg-gray-800/90 px-6 py-5 shadow-lg shadow-black/40 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate('/tasks')}
          className="text-xs text-gray-400 underline-offset-2 hover:text-gray-200 hover:underline"
        >
          ← Back to tasks
        </button>

        {task ? (
          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <header>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                Task {index + 1}
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                A focused view of a single todo from your learning session.
              </p>
            </header>

            <div className="rounded-lg border border-gray-700/70 bg-gray-900/70 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Title
              </p>
              <p className="mt-1 text-sm text-gray-100">{task.text}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-700/70 bg-gray-900/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Description
                </p>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="mt-2 h-24 w-full resize-none rounded-md border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add more context about what this task involves…"
                />
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-gray-700/70 bg-gray-900/70 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Deadline
                  </p>
                  <input
                    type="date"
                    ref={deadlineInputRef}
                    value={deadline}
                    onChange={(event) => setDeadline(event.target.value)}
                    onFocus={handleDeadlineFocus}
                    onMouseEnter={handleDeadlineHover}
                    className="mt-2 w-full rounded-md border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="rounded-lg border border-gray-700/70 bg-gray-900/70 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Priority
                  </p>
                  <div className="mt-2 flex gap-2">
                    {(['low', 'medium', 'high'] as TaskPriority[]).map(
                      (level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setPriority(level)}
                          className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium capitalize ${
                            priority === level
                              ? getTaskPriorityBadgeClasses(level)
                              : 'border-gray-700/70 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          {level}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-700/70 bg-gray-900/70 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Category
                  </p>
                  <div className="mt-2 flex flex-col gap-2 text-xs">
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="w-full rounded-md border border-gray-700 bg-gray-950/70 px-3 py-2 text-xs text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input
                        value={newCategoryInput}
                        onChange={(event) =>
                          setNewCategoryInput(event.target.value)
                        }
                        className="flex-1 rounded-md border border-gray-700 bg-gray-950/70 px-3 py-1.5 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="New category name"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = newCategoryInput.trim()
                          if (!trimmed) return
                          setCategories((prev) =>
                            prev.includes(trimmed) ? prev : [...prev, trimmed],
                          )
                          setCategory(trimmed)
                          setNewCategoryInput('')
                          try {
                            window.localStorage.setItem(
                              TASK_CATEGORIES_STORAGE_KEY,
                              JSON.stringify([
                                ...new Set([...categories, trimmed]),
                              ]),
                            )
                          } catch {
                            // Ignore persistence errors here; categories are still in state.
                          }
                        }}
                        className="rounded-md border border-gray-600 px-3 py-1.5 text-[11px] font-medium text-gray-100 hover:border-gray-400"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-700/70 bg-gray-900/70 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Status
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-gray-700/70 bg-gray-950/70 px-3 py-1.5 text-xs font-medium text-gray-200">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        task.completed ? 'bg-emerald-400' : 'bg-amber-300'
                      }`}
                    />
                    <span>{statusLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-500/40 transition hover:bg-blue-400"
              >
                Save details
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4">
            <h1 className="text-lg font-semibold text-gray-100">
              Task not found
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              We couldn&apos;t find a task for this id. It may have been
              deleted or the URL might be incorrect.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}

export default TaskDetail

