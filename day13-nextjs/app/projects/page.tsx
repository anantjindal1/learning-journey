import type { Metadata } from "next";
import ProjectFilter, { type Project } from "@/components/ProjectFilter";

// Keep project data in-code for now; this mirrors how a simple JSON-powered portfolio or CMS would behave.
const projects: Project[] = [
  {
    title: "Todo CLI",
    description: "A typed command-line todo manager using dataclasses and rich CLI ergonomics.",
    tech: ["Python", "Dataclasses", "Type Hints"],
    status: "Completed",
    type: "Python",
  },
  {
    title: "Tailwind UI Pages",
    description: "A collection of landing pages and layouts built purely with HTML and Tailwind CSS.",
    tech: ["HTML", "Tailwind CSS"],
    status: "In Progress",
    type: "React",
  },
  {
    title: "React Todo App",
    description: "A focused todo application exploring hooks, local state, and component composition.",
    tech: ["React", "Hooks"],
    status: "Completed",
    type: "React",
  },
  {
    title: "Personal Dashboard",
    description: "A personal dashboard pulling in APIs for weather, tasks, and learning metrics. Deployed to the edge.",
    tech: ["React", "TypeScript", "APIs"],
    status: "Deployed",
    type: "TypeScript",
  },
  {
    title: "Shopping Cart",
    description: "E-commerce shopping cart prototype using React Context and reducers for predictable state.",
    tech: ["React", "Context API", "useReducer"],
    status: "Planned",
    type: "React",
  },
  {
    title: "Movie Search",
    description: "Movie search interface with debounced queries, custom hooks, and API error handling.",
    tech: ["React", "Custom Hooks", "Debounce"],
    status: "In Progress",
    type: "React",
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
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
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

