import { useEffect, useState, type FC, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  TASKS_STORAGE_KEY,
  getTaskPriorityBadgeClasses,
  loadTaskCategories,
  persistTaskCategories,
  type Task,
  type TaskPriority,
} from './taskModel'

// We hydrate tasks from localStorage in the initial state function so the list
// is immediately in sync after refresh and we avoid double-hydration in
// development StrictMode. We also pull the router location so the page can
// reflect the current route for subtle context cues.
const Tasks: FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === 'undefined') {
      return []
    }
    try {
      const raw = window.localStorage.getItem(TASKS_STORAGE_KEY)
      if (!raw) {
        return []
      }
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) {
        return []
      }
      return parsed.map((item) => {
        const priority: TaskPriority =
          item.priority === 'high' || item.priority === 'low'
            ? item.priority
            : 'medium'
        return {
          ...item,
          description:
            typeof item.description === 'string' ? item.description : '',
          deadline: typeof item.deadline === 'string' ? item.deadline : '',
          priority,
          category:
            typeof item.category === 'string' && item.category.trim().length > 0
              ? item.category
              : 'General',
        } as Task
      })
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium')
  const [showNewDetails, setShowNewDetails] = useState(false)
  const [categories, setCategories] = useState<string[]>(() => {
    const loaded = loadTaskCategories()
    const fromTasks = new Set(
      tasks
        .map((task) => task.category)
        .filter((value) => typeof value === 'string' && value.length > 0),
    )
    return Array.from(new Set([...loaded, ...fromTasks]))
  })
  const [newCategory, setNewCategory] = useState<string>('General')
  const [newCategoryInput, setNewCategoryInput] = useState<string>('')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    try {
      window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // Ignore persistence failures; the in-memory list should still be usable.
    }
  }, [tasks])

  useEffect(() => {
    persistTaskCategories(categories)
  }, [categories])

  const handleAdd = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    const newTask: Task = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text: trimmed,
      completed: false,
      description: newDescription.trim(),
      deadline: newDeadline,
      priority: newPriority,
      category: newCategory,
    }
    setTasks((prev) => [newTask, ...prev])
    setInput('')
    setNewDescription('')
    setNewDeadline('')
    setNewPriority('medium')
    setNewCategory('General')
    setShowNewDetails(false)
  }

  const handleAddCategory = (): void => {
    const trimmed = newCategoryInput.trim()
    if (trimmed.length === 0) {
      return
    }
    setCategories((prev) => {
      if (prev.includes(trimmed)) {
        return prev
      }
      return [...prev, trimmed]
    })
    setNewCategory(trimmed)
    setNewCategoryInput('')
  }

  const toggleTask = (id: string): void => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  const deleteTask = (id: string): void => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const completedCount = tasks.filter((t) => t.completed).length

  return (
    <main className="space-y-6 md:space-y-8">
      <section className="rounded-xl border border-gray-700/60 bg-gray-800/90 px-6 py-5 shadow-lg shadow-black/40 backdrop-blur">
        <header className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
              Tasks
            </h1>
            <p className="text-sm text-gray-400">
              Capture, complete, and clear your learning todos.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-xs text-gray-400">
              {completedCount}/{tasks.length} completed
            </p>
            <p className="text-[10px] text-gray-500">
              Route: <span className="font-mono">{location.pathname}</span>
            </p>
          </div>
        </header>

        <form onSubmit={handleAdd} className="mt-4 space-y-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onFocus={() => setShowNewDetails(true)}
              className="flex-1 rounded-lg border border-gray-700 bg-gray-900/70 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a task for today’s session…"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-500/40 transition hover:bg-blue-400"
            >
              Add
            </button>
          </div>

          {showNewDetails && (
            <div className="grid gap-3 rounded-lg border border-gray-700/70 bg-gray-900/70 px-4 py-3 text-xs text-gray-200 md:grid-cols-2">
              <div className="space-y-2">
                <p className="font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Description
                </p>
                <textarea
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                  className="h-20 w-full resize-none rounded-md border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What does this task involve?"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <p className="font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Deadline
                  </p>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(event) => setNewDeadline(event.target.value)}
                    className="mt-2 w-full rounded-md border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <p className="font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Priority
                  </p>
                  <div className="mt-2 flex gap-2">
                    {(['low', 'medium', 'high'] as TaskPriority[]).map(
                      (level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setNewPriority(level)}
                          className={`flex-1 rounded-md border px-2 py-1.5 text-[11px] font-medium capitalize ${
                            newPriority === level
                              ? getTaskPriorityBadgeClasses(level)
                              : 'border-gray-700/70 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          {level}
                        </button>
                      ),
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="font-semibold uppercase tracking-[0.18em] text-gray-400">
                      Category
                    </p>
                    <div className="mt-2 flex flex-col gap-2">
                      <select
                        value={newCategory}
                        onChange={(event) => setNewCategory(event.target.value)}
                        className="w-full rounded-md border border-gray-700 bg-gray-950/70 px-3 py-2 text-xs text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
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
                          onClick={handleAddCategory}
                          className="rounded-md border border-gray-600 px-3 py-1.5 text-[11px] font-medium text-gray-100 hover:border-gray-400"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-3 text-xs text-gray-400 underline-offset-2 hover:text-gray-200 hover:underline"
        >
          Back to dashboard
        </button>
      </section>

      <section className="rounded-xl border border-gray-700/60 bg-gray-800/90 px-4 py-4 shadow-lg shadow-black/40 backdrop-blur">
        {tasks.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            No tasks yet. Add your first todo above.
          </p>
        ) : (
          <ul className="divide-y divide-gray-700/70">
            {tasks.map((task, index) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex flex-1 items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border text-[10px]"
                  >
                    <span
                      className={`h-3 w-3 rounded ${
                        task.completed
                          ? 'border border-emerald-400 bg-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                          : 'border border-gray-600 bg-transparent'
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/tasks/${index + 1}`)}
                    className="text-left text-sm text-gray-100 hover:text-white"
                  >
                    <span
                      className={
                        task.completed ? 'text-gray-400 line-through' : ''
                      }
                    >
                      {task.text}
                    </span>
                  </button>
                </div>
                <div className="flex flex-col items-end gap-1 text-[10px]">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-medium ${getTaskPriorityBadgeClasses(
                      task.priority,
                    )}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    <span className="capitalize">
                      {task.priority} priority
                    </span>
                  </span>
                  <span className="rounded-full bg-gray-900/80 px-2 py-0.5 text-[10px] text-gray-300">
                    {task.category}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  className="rounded-md px-2 py-1 text-xs text-gray-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default Tasks

