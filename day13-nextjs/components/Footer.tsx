// Keep the footer simple and server-friendly; no client hooks are needed here.
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-slate-800 bg-slate-900/90">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <div className="space-y-1">
          <p className="text-slate-300">
            Built with React, Next.js, and a lot of AI 🤖
          </p>
          <p className="text-[11px]">
            © {year} Anant Jindal. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://github.com/anantjindal1"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-100 transition hover:border-sky-400 hover:text-sky-300"
          >
            GitHub Profile
          </a>
        </div>
      </div>
    </footer>
  );
}

