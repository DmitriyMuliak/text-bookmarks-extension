# Technical Logic: Text Bookmarks Implementation

This document provides a deep dive into the core mechanisms of the Text Bookmarks extension: how it captures text, identifies its location, and restores it later.

---

## 1. Selection & Capture Logic

When a user selects text, the extension uses the browser's **Selection API**.

### A. Range Object
The `window.getSelection().getRangeAt(0)` provides a `Range` object. This object doesn't just contain text; it contains pointers to the DOM:
- `startContainer`: The Node where the selection begins.
- `startOffset`: The character index within the start node.
- `endContainer`: The Node where the selection ends.
- `endOffset`: The character index within the end node.

### B. XPath Generation (`src/shared/utils/xpath.ts`)
To persist this location, we generate an **XPath** for both the start and end nodes.
- **Why XPath?** Unlike CSS selectors (which can be fragile if classes change), a structural XPath like `/html/body/div[2]/p[1]/text()[1]` is more resilient to minor UI changes.
- **Text Node Precision:** We explicitly target `text()[n]` to handle cases where multiple text segments exist within a single parent element (separated by tags like `<b>` or `<span>`).

---

## 2. Restoration & Highlighting Strategy

Restoring a highlight is a multi-step process designed for maximum reliability.

### Step 1: Structural XPath Match (Primary)
The extension attempts to recreate the `Range` using the saved XPaths:
1. Find `startNode` and `endNode` via `document.evaluate`.
2. Create a new `Range` and set its boundaries using the saved `offsets`.
3. **Validation:** If the nodes are found but the text within the range doesn't match the saved snippet text, the extension treats it as a structural change and moves to Step 2.

### Step 2: TreeWalker Text Search (Fallback)
If the DOM structure changed (e.g., a wrapper `div` was added), the XPath will fail.
1. The extension uses a `TreeWalker` to scan all `TEXT_NODE` elements in the `document.body`.
2. It looks for a match for the first 50 characters of the saved snippet.
3. **Proximity Scoring:** If multiple matches are found, it selects the one closest to the saved `scrollY` position to avoid highlighting the wrong paragraph.

### Step 3: Visual Execution
Once a valid `Range` is identified (via Step 1 or 2):
1. **Wrapping:** `range.extractContents()` is called to move the DOM nodes into a temporary DocumentFragment.
2. **Injection:** This fragment is placed inside a `<mark>` element, which is then inserted back into the DOM at the original position.
3. **Cleanup:** After a 2-second CSS animation, the `<mark>` is "unwrapped" to restore the original DOM structure, preventing interference with the website's own scripts or styles.

---

## 3. Navigation & Tab Management

The Background Service Worker handles the complex task of "Teleportation":

1. **Tab Deduplication:** Before opening a new tab, it queries all open tabs to find a match for the target URL (ignoring hash fragments).
2. **State Synchronization:** 
   - If the tab is already open: It focuses the tab/window and immediately sends a `HIGHLIGHT_SNIPPET` message.
   - If a new tab is opened: It attaches a listener to `chrome.tabs.onUpdated` and waits for `status: 'complete'` before attempting to highlight.
3. **Timing:** It uses a small delay (200-600ms) after the page reports "complete" to allow the website's own JavaScript (like React or Angular) to finish rendering the DOM.

---

## 4. Edge Cases Handled

- **Dynamic Content:** Handles selections across multiple formatting tags (`<b>`, `<i>`, `<a>`).
- **Partial Selections:** Correctly calculates offsets even if the selection starts in the middle of a word.
- **Cross-Window Navigation:** Successfully focuses the correct Chrome window if the target tab is hidden in the background.
- **Script Re-injection:** Uses a `<meta>` guard to ensure the content script doesn't initialize twice on the same page.
