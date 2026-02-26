import { useState } from 'react'

// We keep all app UI and logic in this single component for simplicity.
function App() {
  // We keep the current input text as local state so the component re-renders
  // whenever the user types in the input field.
  const [newTaskTitle, setNewTaskTitle] = useState('')

  // We keep the list of tasks as state so React can efficiently re-render
  // the list when tasks are added, marked done, or deleted.
  const [tasks, setTasks] = useState([])

  // We keep the active filter in state so the UI and counter can reactively
  // change based on the selected filter.
  const [filter, setFilter] = useState('all') // 'all' | 'active' | 'completed'

  // We derive counts from the current tasks state instead of storing them
  // separately to avoid keeping multiple sources of truth.
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length

  const handleAddTask = () => {
    const trimmed = newTaskTitle.trim()
    if (!trimmed) {
      return
    }

    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(), // Simple unique id for this demo; good enough for local state.
        title: trimmed,
        completed: false,
      },
    ])
    setNewTaskTitle('')
  }

  const handleToggleCompleted = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  const handleDeleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleAddTask()
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') {
      return !task.completed
    }
    if (filter === 'completed') {
      return task.completed
    }
    return true
  })

  const isActiveFilter = (value) => filter === value

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
              filteredTasks.map((task) => (
                <article
                  key={task.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm md:text-base transition ${
                    task.completed
                      ? 'bg-emerald-900/40 border-emerald-700/70'
                      : 'bg-slate-900/40 border-slate-700/70'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleCompleted(task.id)}
                    className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center transition ${
                      task.completed
                        ? 'border-emerald-400 bg-emerald-500'
                        : 'border-slate-500'
                    }`}
                    aria-label={task.completed ? 'Mark as not done' : 'Mark as done'}
                  >
                    {task.completed && (
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-950" />
                    )}
                  </button>
                  <p
                    className={`flex-1 break-words ${
                      task.completed ? 'line-through text-emerald-100' : ''
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleCompleted(task.id)}
                      className="rounded-lg border border-emerald-500/70 px-2 py-1 text-xs md:text-sm text-emerald-300 hover:bg-emerald-500/10"
                    >
                      {task.completed ? 'Undo' : 'Mark Done'}
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

// A small presentational component to keep the main App component readable.
function FilterButton({ label, value, active, onClick }) {
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
