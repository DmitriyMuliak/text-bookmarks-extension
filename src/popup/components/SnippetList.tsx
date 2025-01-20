import { useState } from 'react'
import { SavedSnippet } from '../../shared/types'
import { SnippetItem } from './SnippetItem'

export function SnippetList({ grouped }: { grouped: Map<string, SavedSnippet[]> }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const toggle = (d: string) =>
    setCollapsed((prev) => {
      const n = new Set(prev)
      if (n.has(d)) n.delete(d)
      else n.add(d)
      return n
    })

  return (
    <div className="flex flex-col">
      {Array.from(grouped.entries()).map(([domain, snippets]) => (
        <div key={domain} className="border-b border-slate-700/30">
          <button
            onClick={() => toggle(domain)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-800/40"
          >
            <span className="text-xs font-semibold text-slate-300">
              {domain} ({snippets.length})
            </span>
          </button>
          {!collapsed.has(domain) && (
            <div className="flex flex-col gap-2 px-3 pb-3">
              {snippets.map((s) => (
                <SnippetItem key={s.id} snippet={s} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
