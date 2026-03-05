"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Keep the navbar client-side so we can read the current pathname and manage mobile menu state.
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/blog") {
    return pathname === "/blog" || pathname.startsWith("/blog/");
  }

  return pathname === href;
}

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="rounded-md bg-sky-500 px-2 py-1 text-xs font-bold text-slate-950">
            AJ.dev
          </span>
          <span className="hidden text-slate-200 sm:inline">
            Personal journey log
          </span>
        </Link>

        {/* Desktop nav keeps things simple and readable; mobile collapses into a hamburger for small screens. */}
        <div className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
          {navLinks.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "relative transition-colors",
                  active
                    ? "text-sky-400"
                    : "text-slate-300 hover:text-sky-300",
                ].join(" ")}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-sky-400 to-transparent" />
                )}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-100 shadow-sm hover:border-slate-500 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="flex flex-col gap-0.5">
            <span className="h-0.5 w-4 rounded bg-slate-100" />
            <span className="h-0.5 w-4 rounded bg-slate-100" />
          </span>
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-slate-800 bg-slate-900 md:hidden">
          <div className="mx-auto flex max-w-5xl flex-col px-4 py-2 sm:px-8 lg:px-12">
            {navLinks.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={[
                    "block rounded-md px-2 py-2 text-sm font-medium",
                    active
                      ? "bg-slate-800 text-sky-300"
                      : "text-slate-200 hover:bg-slate-800/70 hover:text-sky-200",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

