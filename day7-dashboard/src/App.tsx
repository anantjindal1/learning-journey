import type { FC } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Progress from './pages/Progress'
import About from './pages/About'

// We centralise the shared shell (background, max-width container, navbar)
// so that all pages feel like part of a single dashboard experience while
// routes only focus on their own content.
const App: FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <div className="mx-auto flex max-w-5xl flex-col px-4 py-6 md:py-10">
        <Navbar />
        <div className="mt-6 md:mt-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/progress/:weekId" element={<Progress />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App

