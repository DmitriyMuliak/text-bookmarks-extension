import { useState, useRef, useEffect, useCallback } from 'react'
import { SavedSnippet } from '../../shared/types'
import { useSnippetsStore } from '../stores/snippetsStore'
import { Button } from './ui/Button'

export function SnippetItem({ snippet }: { snippet: SavedSnippet }) {
  const { updateTitle, deleteSnippet, navigateToSnippet } = useSnippetsStore()
  const [editing, setEditing] = useState(false)
  const [titleVal, setTitleVal] = useState(snippet.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const commitTitle = useCallback(async () => {
    const t = titleVal.trim()
    if (t && t !== snippet.title) await updateTitle(snippet.id, t)
    else setTitleVal(snippet.title)
    setEditing(false)
  }, [titleVal, snippet, updateTitle])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      void commitTitle()
    }
    if (e.key === 'Escape') {
      setTitleVal(snippet.title)
      setEditing(false)
    }
  }

  return (
    <div
      onClick={() => void navigateToSnippet(snippet)}
      className="group p-3 rounded-xl border border-slate-700/40 bg-slate-800/50 hover:border-indigo-500/40 cursor-pointer transition-all duration-150"
    >
      <div className="flex items-center gap-2 mb-1.5" onClick={(e) => e.stopPropagation()}>
        {editing ? (
          <input
            ref={inputRef}
            value={titleVal}
            onChange={(e) => setTitleVal(e.target.value)}
            onBlur={() => void commitTitle()}
            onKeyDown={onKeyDown}
            className="flex-1 text-sm bg-slate-700 text-slate-100 px-2 py-0.5 rounded border border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        ) : (
          <span
            className="flex-1 text-sm font-semibold text-slate-100 truncate"
            onDoubleClick={() => setEditing(true)}
            title="Double-click to rename"
          >
            {snippet.title}
          </span>
        )}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="xs"
            title="Rename"
            onClick={(e) => {
              e.stopPropagation()
              setEditing(true)
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Button>
          <Button
            variant="danger"
            size="xs"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation()
              void deleteSnippet(snippet.id)
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>
        </div>
      </div>
      <p className="text-xs text-slate-400 line-clamp-2 mb-2 italic pl-0.5">
        &ldquo;{snippet.text}&rdquo;
      </p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500 truncate max-w-[280px]" title={snippet.url}>
          {snippet.url}
        </span>
        <span className="text-[10px] text-slate-600 shrink-0">
          {new Date(snippet.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}
