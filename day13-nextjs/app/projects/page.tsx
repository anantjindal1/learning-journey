import type { Metadata } from "next";
import ProjectFilter, { type Project } from "@/components/ProjectFilter";

// Keep project data in-code for now; this mirrors how a simple JSON-powered
// portfolio or CMS-like JSON source might behave.
const projects: Project[] = [
  {
    id: 1,
    title: "Todo CLI",
    desc: "Python CLI with dataclasses and type hints",
    tags: ["Python", "CLI"],
    status: "Complete",
    color: "green",
  },
  {
    id: 2,
    title: "Tailwind UI",
    desc: "HTML pages with utility-first CSS",
    tags: ["HTML", "Tailwind"],
    status: "Complete",
    color: "green",
  },
  {
    id: 3,
    title: "React Todo",
    desc: "Todo app with useState hooks and filters",
    tags: ["React", "JavaScript"],
    status: "Complete",
    color: "green",
  },
  {
    id: 4,
    title: "Personal Dashboard",
    desc: "Live dashboard with weather API and clock",
    tags: ["React", "TypeScript", "Tailwind"],
    status: "Live",
    color: "blue",
  },
  {
    id: 5,
    title: "Shopping Cart",
    desc: "Global state with Context API and useReducer",
    tags: ["React", "TypeScript"],
    status: "Complete",
    color: "green",
  },
  {
    id: 6,
    title: "Movie Search",
    desc: "Real API calls with debounce and custom hooks",
    tags: ["React", "TypeScript", "API"],
    status: "Complete",
    color: "green",
  },
];

export const metadata: Metadata = {
  title: "Projects — Anant Jindal",
};

export default function ProjectsPage() {
  return (
    <div className="px-4 pb-16 pt-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Projects
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
            A curated set of small, focused projects to rebuild muscle memory
            across Python, React, and TypeScript — with AI tools helping
            accelerate the feedback loop.
          </p>
        </header>

        {/* Delegate filtering to a client component so this page can stay a simple server component wrapper. */}
        <ProjectFilter projects={projects} />
      </div>
    </div>
  );
}

