import { useEffect, useState } from 'react'
import { useSnippetsStore } from './stores/snippetsStore'
import { Header } from './components/Header'
import { SnippetList } from './components/SnippetList'
import { EmptyState } from './components/EmptyState'
import { SavedSnippet } from '../shared/types'

export function App() {
  const store = useSnippetsStore()
  const [query, setQuery] = useState('')

  useEffect(() => {
    void store.initialize()
  }, [store])

  const filtered = store.snippets.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.text.toLowerCase().includes(query.toLowerCase()),
  )

  const grouped = new Map<string, SavedSnippet[]>()
  filtered.forEach((s) => {
    const arr = grouped.get(s.domain) ?? []
    arr.push(s)
    grouped.set(s.domain, arr)
  })

  if (!store.isLoaded) return <div className="flex items-center justify-center min-h-48">Loading...</div>

  return (
    <div className="flex flex-col h-full">
      <Header count={store.snippets.length} query={query} onQueryChange={setQuery} />
      <main className="flex-1 overflow-y-auto">
        {store.snippets.length === 0 ? <EmptyState /> : <SnippetList grouped={grouped} />}
      </main>
    </div>
  )
}
