import type { FC } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import TaskDetail from './pages/TaskDetail'
import Progress from './pages/Progress'
import About from './pages/About'
import NotFound from './pages/NotFound'

// We centralise the shared shell (background, max-width container, navbar)
// so that all pages feel like part of a single dashboard experience while
// routes only focus on their own content.
const App: FC = () => {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-900 text-white bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <div className="mx-auto flex max-w-5xl flex-col px-4 py-6 md:py-10">
        <Navbar />
        <div className="mt-6 md:mt-8">
          <div key={location.pathname} className="page-fade">
            <Routes location={location}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/progress/:weekId" element={<Progress />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

