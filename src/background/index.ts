/// <reference types='chrome' />
import type { BackgroundMessage } from '../shared/types'

const TAG = '[TextBookmarks SW]'

chrome.runtime.onInstalled.addListener(() => console.log(TAG, 'installed'))

chrome.runtime.onMessage.addListener((msg: BackgroundMessage, _sender, sendResponse) => {
  if (msg.type === 'NAVIGATE_AND_HIGHLIGHT') {
    // TODO: implement navigation and highlight logic
    sendResponse({ ok: true })
  }
  return false
})
