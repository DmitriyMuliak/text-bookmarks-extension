// Core domain model
export interface SavedSnippet {
  id: string
  title: string // user-editable label
  text: string // the selected text
  url: string // full URL of the page
  domain: string // hostname for grouping
  xpath: string // XPath to start text node
  startOffset: number // char offset in start node
  endXpath: string // XPath to end text node
  endOffset: number // char offset in end node
  scrollY: number // fallback scroll position
  createdAt: number // unix timestamp ms
}

export interface StorageData {
  snippets: SavedSnippet[]
  version: number
}

export type CreateSnippetPayload = Omit<SavedSnippet, 'id' | 'createdAt'>

// Message bus types
export type BackgroundMessage = { type: 'NAVIGATE_AND_HIGHLIGHT'; snippet: SavedSnippet }
export type ContentMessage = { type: 'HIGHLIGHT_SNIPPET'; snippet: SavedSnippet }
