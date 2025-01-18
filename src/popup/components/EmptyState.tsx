export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-14 px-8 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-3xl">
        &#128204;
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">No bookmarks yet</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-52">
          Select any text on a webpage — a <strong className="text-slate-400">Save snippet</strong>{' '}
          button will appear. Click it to bookmark that passage.
        </p>
      </div>
    </div>
  )
}
