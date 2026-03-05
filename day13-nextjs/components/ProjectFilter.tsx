"use client";

import Link from "next/link";
import { useState } from "react";

type ProjectType = "All" | "Python" | "React" | "TypeScript";

export type Project = {
  title: string;
  description: string;
  tech: string[];
  status: "In Progress" | "Deployed" | "Completed" | "Planned";
  type: Exclude<ProjectType, "All">;
  githubUrl?: string;
};

interface ProjectFilterProps {
  projects: Project[];
}

const filters: ProjectType[] = ["All", "Python", "React", "TypeScript"];

// Keep filtering logic on the client to make it instant and ready for future expansion (search, tags, etc.).
export default function ProjectFilter({ projects }: ProjectFilterProps) {
  const [activeFilter, setActiveFilter] = useState<ProjectType>("All");

  const filteredProjects =
    activeFilter === "All"
      ? projects
      : projects.filter((project) => project.type === activeFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={[
                "rounded-full px-3 py-1 text-xs font-medium transition",
                isActive
                  ? "bg-sky-500 text-slate-950 shadow-sm shadow-sky-900/60"
                  : "border border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-500",
              ].join(" ")}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {filteredProjects.map((project) => (
          <article
            key={project.title}
            className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm shadow-slate-950/40"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-50">
                {project.title}
              </h3>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300">
                {project.status}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300">{project.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
              <span>{project.type}</span>
              <span>
                {project.githubUrl ? (
                  <Link
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300"
                  >
                    View on GitHub
                  </Link>
                ) : (
                  <span className="text-slate-500">GitHub coming soon</span>
                )}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

