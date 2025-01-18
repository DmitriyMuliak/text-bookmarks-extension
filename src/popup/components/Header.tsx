interface Props {
  count: number
  query: string
  onQueryChange: (q: string) => void
}

export function Header({ count, query, onQueryChange }: Props) {
  return (
    <header className="bg-slate-900 border-b border-slate-700/50 shrink-0">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">&#128204;</span>
          <div>
            <h1 className="text-sm font-bold text-slate-100 leading-none">Text Bookmarks</h1>
            <p className="text-xs text-slate-500 mt-0.5">Select text on any page to save</p>
          </div>
        </div>
        {count > 0 && (
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700/50">
            {count}
          </span>
        )}
      </div>
      <div className="px-3 pb-3">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            placeholder="Search bookmarks..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700/50
              text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>
    </header>
  )
}
