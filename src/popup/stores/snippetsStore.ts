import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { SavedSnippet } from '../../shared/types'
import { storageService } from '../../shared/utils/storage'

interface SnippetsStore {
  snippets: SavedSnippet[]
  isLoaded: boolean
  error: string | null
  initialize: () => Promise<void>
  updateTitle: (id: string, title: string) => Promise<void>
  deleteSnippet: (id: string) => Promise<void>
  navigateToSnippet: (snippet: SavedSnippet) => Promise<void>
}

let cancelStorage: (() => void) | null = null

export const useSnippetsStore = create<SnippetsStore>()(
  devtools(
    (set, get) => ({
      snippets: [],
      isLoaded: false,
      error: null,

      initialize: async () => {
        try {
          const snippets = await storageService.getAll()
          set({ snippets, isLoaded: true, error: null }, false, 'init')
          cancelStorage?.()
          cancelStorage = storageService.onChanged((snippets) => {
            set({ snippets }, false, 'storageSync')
          })
        } catch (e) {
          set(
            { isLoaded: true, error: e instanceof Error ? e.message : 'Load failed' },
            false,
            'init/err',
          )
        }
      },

      updateTitle: async (id, title) => {
        await storageService.updateTitle(id, title)
        set(
          { snippets: get().snippets.map((s) => (s.id === id ? { ...s, title } : s)) },
          false,
          'updateTitle',
        )
      },

      deleteSnippet: async (id) => {
        await storageService.deleteSnippet(id)
        set({ snippets: get().snippets.filter((s) => s.id !== id) }, false, 'delete')
      },

      navigateToSnippet: async (snippet) => {
        await chrome.runtime.sendMessage({ type: 'NAVIGATE_AND_HIGHLIGHT', snippet })
        window.close()
      },
    }),
    { name: 'SnippetsStore' },
  ),
)
