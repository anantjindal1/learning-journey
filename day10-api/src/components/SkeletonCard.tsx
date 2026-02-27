// A lightweight skeleton card that roughly matches the movie card
// layout so loading states feel stable instead of jarring.
export function SkeletonCard() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-2xl bg-slate-900/70 ring-1 ring-slate-800">
      <div className="relative aspect-[2/3] bg-slate-800">
        <div className="absolute left-3 top-3 h-6 w-16 rounded-full bg-slate-700" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="h-4 w-5/6 rounded bg-slate-700" />
        <div className="h-3 w-1/3 rounded bg-slate-800" />
      </div>
    </div>
  )
}

