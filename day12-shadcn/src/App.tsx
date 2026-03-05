import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Project and Skill interfaces keep the dashboard data-driven and type-safe.
interface Project {
  id: number
  name: string
  description: string
  tech: string[]
  status: "Complete" | "Live"
  link?: string
}

interface Skill {
  name: string
  level: number
  colorClass: string
}

interface SkillCategory {
  name: string
  skills: Skill[]
}

const initialProjects: Project[] = [
  {
    id: 1,
    name: "Todo CLI",
    description: "Python CLI with dataclasses and type hints",
    tech: ["Python", "CLI"],
    status: "Complete",
  },
  {
    id: 2,
    name: "Personal Dashboard",
    description: "Live dashboard with weather and clock",
    tech: ["React", "TypeScript", "Tailwind"],
    status: "Live",
    link: "https://learning-journey-gamma.vercel.app",
  },
  {
    id: 3,
    name: "Shopping Cart",
    description: "Global state with Context + useReducer",
    tech: ["React", "Context API"],
    status: "Complete",
  },
  {
    id: 4,
    name: "Movie Search",
    description: "Real API calls with debounce and custom hooks",
    tech: ["React", "OMDB API"],
    status: "Complete",
  },
]

const skillCategories: SkillCategory[] = [
  {
    name: "Languages",
    skills: [
      { name: "Python", level: 80, colorClass: "bg-emerald-500" },
      { name: "TypeScript", level: 60, colorClass: "bg-sky-500" },
      { name: "Java", level: 80, colorClass: "bg-amber-500" },
      { name: "JavaScript", level: 65, colorClass: "bg-yellow-400" },
    ],
  },
  {
    name: "Frontend",
    skills: [
      { name: "React", level: 70, colorClass: "bg-sky-500" },
      { name: "Tailwind", level: 80, colorClass: "bg-teal-400" },
      { name: "HTML/CSS", level: 80, colorClass: "bg-pink-500" },
      { name: "shadcn/ui", level: 50, colorClass: "bg-violet-500" },
    ],
  },
  {
    name: "Backend",
    skills: [
      { name: "FastAPI", level: 40, colorClass: "bg-emerald-500" },
      { name: "Spring Boot", level: 60, colorClass: "bg-green-500" },
      { name: "REST APIs", level: 70, colorClass: "bg-blue-500" },
    ],
  },
  {
    name: "Tools",
    skills: [
      { name: "Git/GitHub", level: 80, colorClass: "bg-orange-500" },
      { name: "Cursor/AI", level: 85, colorClass: "bg-indigo-500" },
      { name: "Docker", level: 30, colorClass: "bg-sky-500" },
      { name: "Vercel", level: 65, colorClass: "bg-emerald-500" },
    ],
  },
]

const totalDays = 42
const currentDay = 12
// Use floor so the UI matches the requested "28%" wording.
const progressPercent = Math.floor((currentDay / totalDays) * 100)

export default function App() {
  // Dark mode is driven by a single source of truth and persisted to localStorage.
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true
    const stored = window.localStorage.getItem("theme")
    if (stored === "dark") return true
    if (stored === "light") return false
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    if (typeof document === "undefined") return
    if (isDark) {
      document.documentElement.classList.add("dark")
      window.localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      window.localStorage.setItem("theme", "light")
    }
  }, [isDark])

  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [projectTech, setProjectTech] = useState("")

  // Keep project creation minimal but real: newly added projects show up in the grid.
  const handleAddProject = () => {
    if (projectName.trim()) {
      const techStack = projectTech
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      const newProject: Project = {
        id: projects.length + 1,
        name: projectName.trim(),
        description: projectDescription.trim() || "Custom project",
        tech: techStack.length ? techStack : ["Custom"],
        status: "Complete",
      }

      setProjects((prev) => [...prev, newProject])
    }

    setProjectName("")
    setProjectDescription("")
    setProjectTech("")
    setIsDialogOpen(false)
  }

  // Precompute the 6x7 grid for the journey view for simpler rendering.
  const weeks = Array.from({ length: 6 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => weekIndex * 7 + dayIndex + 1),
  )

  const renderDayBox = (day: number) => {
    const isPast = day < currentDay
    const isToday = day === currentDay

    const baseClasses =
      "h-6 w-6 rounded-md border border-slate-800 transition-colors"

    const bgClass = isPast
      ? "bg-emerald-500"
      : isToday
        ? "bg-blue-500 animate-pulse"
        : "bg-slate-800"

    return (
      <div
        key={day}
        className={`${baseClasses} ${bgClass}`}
        title={`Day ${day}`}
        aria-label={`Day ${day}`}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex">
      {/* Sidebar pins your identity and primary nav while the main area scrolls independently. */}
      <aside className="w-64 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6">
        <div>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-600 text-white font-semibold">
                AJ
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-white font-semibold">Anant Jindal</div>
              <div className="text-sm text-slate-400">Full Stack Developer</div>
            </div>
          </div>

          <div className="mt-6 h-px bg-slate-800" />

          <nav className="mt-6 space-y-1 text-sm">
            <div className="cursor-pointer rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2">
              <span>📊</span>
              <span>Overview</span>
            </div>
            <div className="cursor-pointer rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2">
              <span>🚀</span>
              <span>Projects</span>
            </div>
            <div className="cursor-pointer rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2">
              <span>🛠</span>
              <span>Skills</span>
            </div>
            <div className="cursor-pointer rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2">
              <span>📅</span>
              <span>Progress</span>
            </div>
          </nav>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <Button
            variant="outline"
            className="w-full justify-between border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-slate-50"
            onClick={() => setIsDark((prev) => !prev)}
          >
            <span>{isDark ? "Switch to Light" : "Switch to Dark"}</span>
            <span>{isDark ? "🌙" : "☀️"}</span>
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Developer Portfolio Dashboard
            </h1>
            <p className="text-sm text-slate-400">
              Track your 42-day learning journey and showcase your work.
            </p>
          </div>
          <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/40">
            Day {currentDay} of {totalDays}
          </Badge>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-slate-900/60 border border-slate-800">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">
                      Projects Built
                    </CardTitle>
                    <span className="text-lg">🚀</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold text-white">6</div>
                    <p className="text-xs text-slate-500">
                      Across CLI, web, and full-stack.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">
                      Languages
                    </CardTitle>
                    <span className="text-lg">💻</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold text-white">5</div>
                    <p className="text-xs text-slate-500">
                      From Python to TypeScript and Java.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">
                      Days Complete
                    </CardTitle>
                    <span className="text-lg">📅</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold text-white">12</div>
                    <p className="text-xs text-slate-500">
                      Consistent daily progress on your journey.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">
                      Apps Deployed
                    </CardTitle>
                    <span className="text-lg">🌍</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold text-white">3</div>
                    <p className="text-xs text-slate-500">
                      Production-ready experiences shipped to users.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-slate-400">
                    The last five days of your learning journey.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">
                        Day 12
                      </span>
                      <span className="text-slate-400">
                        shadcn/ui + v0.dev
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">
                        Day 11
                      </span>
                      <span className="text-slate-400">
                        Forms + Zod validation
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">
                        Day 10
                      </span>
                      <span className="text-slate-400">
                        Movie Search API
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">Day 9</span>
                      <span className="text-slate-400">
                        Shopping Cart + Global State
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">Day 8</span>
                      <span className="text-slate-400">React Router</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Projects
                  </h2>
                  <p className="text-sm text-slate-400">
                    A snapshot of what you&apos;ve built so far.
                  </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-slate-700 text-slate-200 hover:bg-slate-800"
                    >
                      Add Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-slate-800">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        Add Project
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-sm text-slate-300">
                          Project Name
                        </label>
                        <Input
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          placeholder="My new project"
                          className="bg-slate-950 border-slate-800 text-slate-100"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-slate-300">
                          Description
                        </label>
                        <Input
                          value={projectDescription}
                          onChange={(e) =>
                            setProjectDescription(e.target.value)
                          }
                          placeholder="What does it do?"
                          className="bg-slate-950 border-slate-800 text-slate-100"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-slate-300">
                          Tech Stack (comma-separated)
                        </label>
                        <Input
                          value={projectTech}
                          onChange={(e) => setProjectTech(e.target.value)}
                          placeholder="React, TypeScript, Tailwind"
                          className="bg-slate-950 border-slate-800 text-slate-100"
                        />
                      </div>
                      <div className="pt-2 flex justify-end">
                        <Button
                          onClick={handleAddProject}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="bg-slate-900 border-slate-800 flex flex-col"
                  >
                    <CardHeader className="space-y-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-base">
                          {project.name}
                        </CardTitle>
                        <Badge
                          className={
                            project.status === "Live"
                              ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          }
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-400">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((tech) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="border-slate-700 text-slate-200"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        {project.link ? (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 underline"
                          >
                            View live project
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500">
                            Local / learning project
                          </span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-700 text-slate-200 hover:bg-slate-800"
                        >
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillCategories.map((category) => (
                  <Card
                    key={category.name}
                    className="bg-slate-900 border-slate-800"
                  >
                    <CardHeader>
                      <CardTitle className="text-white text-base">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Depth across your current stack.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {category.skills.map((skill) => (
                        <div
                          key={skill.name}
                          className="flex items-center gap-3 text-sm"
                        >
                          <div className="w-28 text-slate-200">
                            {skill.name}
                          </div>
                          <div className="flex-1">
                            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full ${skill.colorClass}`}
                                style={{ width: `${skill.level}%` }}
                              />
                            </div>
                          </div>
                          <div className="w-10 text-right text-xs text-slate-400">
                            {skill.level}%
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">
                    Day {currentDay} of {totalDays}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Visualize your 42-day journey at a glance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-300">
                        Overall Progress ({progressPercent}%)
                      </span>
                      <span className="text-slate-400">
                        {currentDay}/{totalDays} days
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-6 gap-4">
                      {weeks.map((week, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="grid grid-rows-7 gap-1">
                            {week.map((day) =>
                              day <= totalDays ? renderDayBox(day) : null,
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Week {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-300">
                    You&apos;re {progressPercent}% through your journey. Keep
                    going! 🔥
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  )
}