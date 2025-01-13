/// <reference types='chrome' />
import type { BackgroundMessage, SavedSnippet } from '../shared/types'

const TAG = '[TextBookmarks SW]'

chrome.runtime.onInstalled.addListener(() => console.log(TAG, 'installed'))

chrome.runtime.onMessage.addListener((msg: BackgroundMessage, _sender, sendResponse) => {
  if (msg.type === 'NAVIGATE_AND_HIGHLIGHT') {
    void navigateAndHighlight(msg.snippet)
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }))
    return true
  }
  return false
})

async function navigateAndHighlight(snippet: SavedSnippet): Promise<void> {
  const allTabs = await chrome.tabs.query({})
  const baseUrl = snippet.url.split('#')[0]
  const existing = allTabs.find((t) => t.url?.startsWith(baseUrl))

  let tabId: number

  if (existing?.id != null) {
    tabId = existing.id
    await chrome.tabs.update(tabId, { active: true })
    if (existing.windowId != null) await chrome.windows.update(existing.windowId, { focused: true })
    await tryHighlight(tabId, snippet, 150)
  } else {
    const tab = await chrome.tabs.create({ url: snippet.url })
    tabId = tab.id!
    await waitTabComplete(tabId)
    await tryHighlight(tabId, snippet, 400)
  }
}

export async function navigateAndHighlightNew(snippet: SavedSnippet): Promise<void> {
  const allTabs = await chrome.tabs.query({})
  const targetBaseUrl = snippet.url.split('#')[0]

  const existingTab = allTabs.find((t) => t.url && t.url.split('#')[0] === targetBaseUrl)

  let tabId: number

  if (existingTab?.id != null) {
    tabId = existingTab.id
    console.log(TAG, 'Found existing tab:', tabId)

    await chrome.tabs.update(tabId, { active: true })

    if (existingTab.windowId != null) {
      await chrome.windows.update(existingTab.windowId, { focused: true })
    }

    await tryHighlight(tabId, snippet, 200)
  } else {
    console.log(TAG, 'Opening new tab for:', snippet.url)

    const newTab = await chrome.tabs.create({ url: snippet.url })
    tabId = newTab.id!

    try {
      await waitTabComplete(tabId)
      await tryHighlight(tabId, snippet, 600)
    } catch (err) {
      console.error(TAG, 'Failed to wait for tab load:', err)
    }
  }
}

function waitTabComplete(tabId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(handler)
      reject(new Error('Tab load timeout'))
    }, 30_000)

    function handler(id: number, info: chrome.tabs.TabChangeInfo): void {
      if (id !== tabId || info.status !== 'complete') return
      clearTimeout(timer)
      chrome.tabs.onUpdated.removeListener(handler)
      resolve()
    }

    chrome.tabs.onUpdated.addListener(handler)
  })
}

async function tryHighlight(tabId: number, snippet: SavedSnippet, delayMs: number): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, delayMs))
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'HIGHLIGHT_SNIPPET', snippet })
  } catch (e) {
    console.warn(TAG, 'Could not reach content script:', e)
  }
}
