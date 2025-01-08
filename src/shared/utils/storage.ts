import { v4 as uuid } from 'uuid'
import type { SavedSnippet, StorageData, CreateSnippetPayload } from '../types'
import { STORAGE_KEY, STORAGE_VERSION } from '../constants'

const pack = (snippets: SavedSnippet[]): Record<string, StorageData> => ({
  [STORAGE_KEY]: { snippets, version: STORAGE_VERSION },
})

export const storageService = {
  async getAll(): Promise<SavedSnippet[]> {
    const res = await chrome.storage.local.get(STORAGE_KEY)
    const data = res[STORAGE_KEY] as StorageData | undefined
    return data?.snippets ?? []
  },

  async addSnippet(payload: CreateSnippetPayload): Promise<SavedSnippet> {
    const all = await this.getAll()
    const item: SavedSnippet = { ...payload, id: uuid(), createdAt: Date.now() }
    await chrome.storage.local.set(pack([...all, item]))
    return item
  },

  async updateTitle(id: string, title: string): Promise<void> {
    const all = await this.getAll()
    await chrome.storage.local.set(pack(all.map((s) => (s.id === id ? { ...s, title } : s))))
  },

  async deleteSnippet(id: string): Promise<void> {
    const all = await this.getAll()
    await chrome.storage.local.set(pack(all.filter((s) => s.id !== id)))
  },

  onChanged(cb: (snippets: SavedSnippet[]) => void): () => void {
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (!(STORAGE_KEY in changes)) return
      const data = changes[STORAGE_KEY].newValue as StorageData | undefined
      cb(data?.snippets ?? [])
    }
    chrome.storage.local.onChanged.addListener(listener)
    return () => {
      chrome.storage.local.onChanged.removeListener(listener)
    }
  },
}
