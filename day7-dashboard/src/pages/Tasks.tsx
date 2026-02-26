import { useEffect, useState, type FC, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface Task {
  id: string
  text: string
  completed: boolean
}

const TASKS_STORAGE_KEY = 'personal-dashboard:tasks'

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
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        return []
      }
      return parsed as Task[]
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    try {
      window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // Ignore persistence failures; the in-memory list should still be usable.
    }
  }, [tasks])

  const handleAdd = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    const newTask: Task = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text: trimmed,
      completed: false,
    }
    setTasks((prev) => [newTask, ...prev])
    setInput('')
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

        <form onSubmit={handleAdd} className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="flex-1 rounded-lg border border-gray-700 bg-gray-900/70 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add a task for today’s session…"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-500/40 transition hover:bg-blue-400"
          >
            Add
          </button>
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
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className="flex flex-1 items-start gap-3 text-left"
                >
                  <span
                    className={`mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border text-[10px] ${
                      task.completed
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                        : 'border-gray-600 text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <span
                    className={`text-sm ${
                      task.completed
                        ? 'text-gray-500 line-through'
                        : 'text-gray-100'
                    }`}
                  >
                    {task.text}
                  </span>
                </button>
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

