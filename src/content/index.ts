import { ContentMessage, CreateSnippetPayload } from '../shared/types'
import { SAVE_BTN_ID, HIGHLIGHT_MARK_ID, HIGHLIGHT_DURATION } from '../shared/constants'
import { storageService } from '../shared/utils/storage'
import { getXPathForNode, getNodeByXPath } from '../shared/utils/xpath'

console.log('[TextBookmarks] Content script loaded and active')

interface PendingSelection {
  text: string
  xpath: string
  startOffset: number
  endXpath: string
  endOffset: number
  scrollY: number
  rect: DOMRect
}

let pending: PendingSelection | null = null

if (!document.getElementById('__tbm-guard__')) {
  const guard = document.createElement('meta')
  guard.id = '__tbm-guard__'
  document.documentElement.appendChild(guard)
  bootstrap()
}

function bootstrap(): void {
  console.log('[TextBookmarks] Bootstrapping listeners...')
  document.addEventListener('mouseup', onMouseUp, true)
  document.addEventListener('mousedown', onMouseDown, true)
  chrome.runtime.onMessage.addListener(onExtensionMessage)
}

function getOrCreateBtn(): HTMLElement {
  let btn = document.getElementById(SAVE_BTN_ID)
  if (btn) return btn

  console.log('[TextBookmarks] Creating button element')
  btn = document.createElement('div')
  btn.id = SAVE_BTN_ID
  const s = btn.style
  s.setProperty('position', 'fixed', 'important')
  s.setProperty('z-index', '2147483647', 'important')
  s.setProperty('display', 'none', 'important')
  s.setProperty('align-items', 'center', 'important')
  s.setProperty('justify-content', 'center', 'important')
  s.setProperty('gap', '8px', 'important')
  s.setProperty('background', '#6366f1', 'important')
  s.setProperty('color', '#ffffff', 'important')
  s.setProperty('padding', '8px 16px', 'important')
  s.setProperty('border-radius', '10px', 'important')
  s.setProperty('font-size', '14px', 'important')
  s.setProperty('font-weight', 'bold', 'important')
  s.setProperty('font-family', 'system-ui, -apple-system, sans-serif', 'important')
  s.setProperty('cursor', 'pointer', 'important')
  s.setProperty('user-select', 'none', 'important')
  s.setProperty('box-shadow', '0 10px 25px rgba(0,0,0,0.5)', 'important')
  s.setProperty('border', '2px solid #ffffff', 'important')
  s.setProperty('pointer-events', 'auto', 'important')
  s.setProperty('min-width', '130px', 'important')
  s.setProperty('height', 'auto', 'important')

  btn.innerHTML =
    '<span style="font-size:18px !important;">\u{1F4CC}</span> <span style="color:#fff !important; display:inline !important;">Save snippet</span>'

  btn.addEventListener(
    'mousedown',
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      console.log('[TextBookmarks] Button click detected')
      void handleSave()
    },
    true,
  )

  document.documentElement.appendChild(btn)
  return btn
}

function positionBtn(rect: DOMRect): void {
  const btn = getOrCreateBtn()
  const top = Math.max(10, rect.top - 55)
  const left = Math.max(10, Math.min(rect.left, window.innerWidth - 160))

  btn.style.setProperty('top', top + 'px', 'important')
  btn.style.setProperty('left', left + 'px', 'important')
  btn.style.setProperty('display', 'flex', 'important')
  console.log(`[TextBookmarks] Button visible at Top: ${top}px, Left: ${left}px`)
}

function hideBtn(): void {
  const btn = document.getElementById(SAVE_BTN_ID)
  if (btn) {
    btn.style.setProperty('display', 'none', 'important')
  }
}

function onMouseUp(e: MouseEvent): void {
  if ((e.target as HTMLElement).closest(`#${SAVE_BTN_ID}`)) return

  requestAnimationFrame(() => {
    const sel = window.getSelection()
    const text = sel?.toString().trim() || ''

    if (!sel || sel.isCollapsed || text.length < 2) {
      if (pending) {
        pending = null
        hideBtn()
      }
      return
    }

    console.log('[TextBookmarks] Text selected:', text.substring(0, 30) + '...')

    try {
      const range = sel.getRangeAt(0)
      const xpath = getXPathForNode(range.startContainer)

      if (!xpath) {
        console.warn('[TextBookmarks] XPath failed')
        return
      }

      const rects = range.getClientRects()
      const rect = rects.length > 0 ? rects[0] : range.getBoundingClientRect()

      pending = {
        text,
        xpath,
        startOffset: range.startOffset,
        endXpath: getXPathForNode(range.endContainer),
        endOffset: range.endOffset,
        scrollY: window.scrollY,
        rect: rect,
      }
      positionBtn(pending.rect)
    } catch (err) {
      console.error('[TextBookmarks] Error in onMouseUp:', err)
    }
  })
}

function onMouseDown(e: MouseEvent): void {
  if ((e.target as Element).id === SAVE_BTN_ID) return
  hideBtn()
}

async function handleSave(): Promise<void> {
  if (!pending) return
  const snap = pending
  pending = null

  const btn = getOrCreateBtn()
  btn.innerHTML = '<span>\u23F3</span><span>Saving...</span>'

  const payload: CreateSnippetPayload = {
    title: snap.text.length > 60 ? snap.text.slice(0, 60) + '\u2026' : snap.text,
    text: snap.text,
    url: location.href,
    domain: location.hostname,
    xpath: snap.xpath,
    startOffset: snap.startOffset,
    endXpath: snap.endXpath,
    endOffset: snap.endOffset,
    scrollY: snap.scrollY,
  }

  try {
    await storageService.addSnippet(payload)
    window.getSelection()?.removeAllRanges()
    btn.innerHTML = '<span>\u2713</span><span>Saved!</span>'
    btn.style.background = '#059669'
    setTimeout(() => {
      btn.innerHTML = '<span>\u{1F4CC}</span><span>Save snippet</span>'
      btn.style.background = '#6366f1'
      hideBtn()
    }, 1400)
  } catch (err) {
    btn.innerHTML = '<span>\u2717</span><span>Failed</span>'
    btn.style.background = '#dc2626'
    setTimeout(() => {
      btn.innerHTML = '<span>\u{1F4CC}</span><span>Save snippet</span>'
      btn.style.background = '#6366f1'
    }, 2000)
    console.error('[TextBookmarks] Save failed:', err)
  }
}

function removeHighlight(): void {
  const mark = document.getElementById(HIGHLIGHT_MARK_ID)
  if (!mark) return
  const parent = mark.parentNode
  if (parent) {
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
    parent.removeChild(mark)
  }
}

function animateHighlight(mark: HTMLElement): void {
  mark.id = HIGHLIGHT_MARK_ID
  const s = mark.style
  s.display = 'inline-block'
  s.background = '#fef08a'
  s.borderRadius = '3px'
  s.padding = '0 2px'
  s.outline = '2px solid #eab308'
  s.transition = 'background 0.8s, outline-color 0.8s'
  setTimeout(() => {
    s.background = 'transparent'
    s.outlineColor = 'transparent'
    setTimeout(removeHighlight, 900)
  }, HIGHLIGHT_DURATION)
}

function highlightByXPath(snippet: import('../shared/types').SavedSnippet): boolean {
  const startNode = getNodeByXPath(snippet.xpath)
  const endNode = getNodeByXPath(snippet.endXpath)
  if (!startNode || !endNode) return false

  try {
    const range = document.createRange()
    range.setStart(startNode, snippet.startOffset)
    range.setEnd(endNode, snippet.endOffset)

    const rect = range.getBoundingClientRect()
    const target = window.scrollY + rect.top - window.innerHeight * 0.35
    window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })

    const mark = document.createElement('mark')
    mark.appendChild(range.extractContents())
    range.insertNode(mark)
    animateHighlight(mark)
    return true
  } catch {
    return false
  }
}

function highlightByTextSearch(snippet: import('../shared/types').SavedSnippet): void {
  const searchText = snippet.text.slice(0, 50)
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const tag = n.parentElement?.tagName ?? ''
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(tag)) return NodeFilter.FILTER_REJECT
      return n.textContent?.includes(searchText) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    },
  })

  const candidates: Text[] = []
  let node: Node | null
  while ((node = walker.nextNode())) candidates.push(node as Text)

  if (candidates.length === 0) {
    window.scrollTo({ top: snippet.scrollY, behavior: 'smooth' })
    return
  }

  const best = candidates.reduce((a, b) => {
    const dist = (n: Text) =>
      Math.abs(
        (n.parentElement?.getBoundingClientRect().top ?? 0) + window.scrollY - snippet.scrollY,
      )
    return dist(a) < dist(b) ? a : b
  })

  const idx = best.textContent?.indexOf(searchText) ?? -1
  if (idx === -1) {
    window.scrollTo({ top: snippet.scrollY, behavior: 'smooth' })
    return
  }

  try {
    const range = document.createRange()
    range.setStart(best, idx)
    range.setEnd(best, Math.min(idx + snippet.text.length, best.length))
    const mark = document.createElement('mark')
    mark.appendChild(range.extractContents())
    range.insertNode(mark)
    mark.scrollIntoView({ behavior: 'smooth', block: 'center' })
    animateHighlight(mark)
  } catch {
    window.scrollTo({ top: snippet.scrollY, behavior: 'smooth' })
  }
}

function highlightSnippet(snippet: import('../shared/types').SavedSnippet): void {
  removeHighlight()
  if (!highlightByXPath(snippet)) highlightByTextSearch(snippet)
}

function onExtensionMessage(msg: ContentMessage): void {
  if (msg.type === 'HIGHLIGHT_SNIPPET') highlightSnippet(msg.snippet)
}
