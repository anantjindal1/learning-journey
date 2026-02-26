import { useState, type KeyboardEvent, type FC } from 'react'

// We keep priorities as a string union so the compiler can help us
// catch invalid priority values at compile time.
type Priority = 'high' | 'normal' | 'low'

// We model tasks as a single interface so all code that works with tasks
// shares one consistent shape and the compiler can enforce it.
interface Task {
  id: number
  title: string
  done: boolean
  priority: Priority
}


// We keep all app UI and logic in this single component for simplicity.
const App: FC = () => {
  // We keep the current input text as local state so the component re-renders
  // whenever the user types in the input field.
  const [newTaskTitle, setNewTaskTitle] = useState<string>('')

  // We keep the list of tasks as state so React can efficiently re-render
  // the list when tasks are added, marked done, or deleted.
  const [tasks, setTasks] = useState<Task[]>([])

  // We keep the active filter in state so the UI and counter can reactively
  // change based on the selected filter.
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  // We derive counts from the current tasks state instead of storing them
  // separately to avoid keeping multiple sources of truth.
  const totalTasks: number = tasks.length
  const completedTasks: number = tasks.filter((task: Task) => task.done).length

  const handleAddTask = (): void => {
    const trimmed: string = newTaskTitle.trim()
    if (!trimmed) {
      return
    }

    setTasks((prev: Task[]): Task[] => [
      ...prev,
      {
        id: Date.now(), // Simple unique id for this demo; good enough for local state.
        title: trimmed,
        done: false,
        priority: 'normal', // We default to "normal" priority for new tasks.
      },
    ])
    setNewTaskTitle('')
  }

  const handleToggleDone = (id: number): void => {
    setTasks((prev: Task[]): Task[] =>
      prev.map((task: Task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    )
  }

  const handleDeleteTask = (id: number): void => {
    setTasks((prev: Task[]): Task[] => prev.filter((task: Task) => task.id !== id))
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      handleAddTask()
    }
  }

  const filteredTasks: Task[] = tasks.filter((task: Task) => {
    if (filter === 'active') {
      return !task.done
    }
    if (filter === 'completed') {
      return task.done
    }
    return true
  })

  const isActiveFilter = (value: 'all' | 'active' | 'completed'): boolean =>
    filter === value

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8 border border-slate-700">
          <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                React To‑Do List
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
            <div className="inline-flex rounded-full bg-slate-900/60 border border-slate-700/70 p-1">
              <FilterButton
                label="All"
                value="all"
                active={isActiveFilter('all')}
                onClick={() => setFilter('all')}
              />
              <FilterButton
                label="Active"
                value="active"
                active={isActiveFilter('active')}
                onClick={() => setFilter('active')}
              />
              <FilterButton
                label="Completed"
                value="completed"
                active={isActiveFilter('completed')}
                onClick={() => setFilter('completed')}
              />
            </div>
          </header>

          <section className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(event) => setNewTaskTitle(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a new task..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm md:text-base placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="shrink-0 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm md:text-base font-medium text-slate-950 shadow-sm hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newTaskTitle.trim()}
              >
                Add
              </button>
            </div>
          </section>

          <section className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredTasks.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                {totalTasks === 0
                  ? 'No tasks yet. Add your first one above.'
                  : 'No tasks match this filter.'}
              </p>
            ) : (
              filteredTasks.map((task: Task) => (
                <article
                  key={task.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm md:text-base transition ${
                    task.done
                      ? 'bg-emerald-900/40 border-emerald-700/70'
                      : 'bg-slate-900/40 border-slate-700/70'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleDone(task.id)}
                    className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center transition ${
                      task.done
                        ? 'border-emerald-400 bg-emerald-500'
                        : 'border-slate-500'
                    }`}
                    aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
                  >
                    {task.done && (
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-950" />
                    )}
                  </button>
                  <p
                    className={`flex-1 break-words ${
                      task.done ? 'line-through text-emerald-100' : ''
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleDone(task.id)}
                      className="rounded-lg border border-emerald-500/70 px-2 py-1 text-xs md:text-sm text-emerald-300 hover:bg-emerald-500/10"
                    >
                      {task.done ? 'Undo' : 'Mark Done'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="rounded-lg border border-rose-500/70 px-2 py-1 text-xs md:text-sm text-rose-300 hover:bg-rose-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

interface FilterButtonProps {
  label: string
  value: 'all' | 'active' | 'completed'
  active: boolean
  onClick: () => void
}

// We keep this small presentational component typed so the compiler ensures
// that only valid filter values and callbacks are passed in.
const FilterButton: FC<FilterButtonProps> = ({
  label,
  value,
  active,
  onClick,
}) => {
  const baseClasses =
    'px-3 py-1.5 text-xs md:text-sm rounded-full font-medium transition-colors'

  const activeClasses = 'bg-slate-100 text-slate-900 shadow-sm'
  const inactiveClasses =
    'text-slate-300 hover:bg-slate-700/60 hover:text-white'

  return (
    <button
      type="button"
      onClick={onClick}
      data-filter={value}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
    >
      {label}
    </button>
  )
}

export default App