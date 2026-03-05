"use client";

import { useEffect, useState } from "react";

type Filter = "All" | "Python" | "React" | "TypeScript" | "HTML";

export type Project = {
  id: number;
  title: string;
  desc: string;
  tags: string[];
  status: string;
  color: string;
};

interface ProjectFilterProps {
  projects: Project[];
}

const filters: Filter[] = ["All", "Python", "React", "TypeScript", "HTML"];

// Keep filtering logic and minimal view state on the client
// so the surrounding projects page can remain a server component.
export default function ProjectFilter({ projects }: ProjectFilterProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Use a simple opacity transition to smooth out filter changes
    // without introducing extra animation dependencies.
    setIsTransitioning(true);
    const timeout = setTimeout(() => setIsTransitioning(false), 150);
    return () => clearTimeout(timeout);
  }, [activeFilter]);

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Python") return project.tags.includes("Python");
    if (activeFilter === "React") return project.tags.includes("React");
    if (activeFilter === "TypeScript") return project.tags.includes("TypeScript");
    if (activeFilter === "HTML") return project.tags.includes("HTML");
    return true;
  });

  const visibleCount = filteredProjects.length;
  const totalCount = projects.length;

  const statusColorClasses: Record<string, string> = {
    green: "bg-emerald-500/10 text-emerald-200 border border-emerald-500/40",
    blue: "bg-sky-500/10 text-sky-200 border border-sky-500/40",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        <p className="text-xs text-slate-400">
          Showing {visibleCount} of {totalCount} projects
        </p>
      </div>

      <div
        className={[
          "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-300",
          isTransitioning ? "opacity-0" : "opacity-100",
        ].join(" ")}
      >
        {filteredProjects.map((project) => (
          <article
            key={project.id}
            className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm shadow-slate-950/40"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-50">
                {project.title}
              </h3>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em]",
                  statusColorClasses[project.color] ??
                    "bg-slate-800 text-slate-300",
                ].join(" ")}
              >
                {project.status}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300">{project.desc}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

