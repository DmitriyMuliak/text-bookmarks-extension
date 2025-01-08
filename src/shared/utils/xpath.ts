function elementXPath(el: Element): string {
  if (el === document.documentElement) return '/html'
  if (el === document.body) return '/html/body'

  const parent = el.parentElement
  if (!parent) return '/' + el.tagName.toLowerCase()

  const siblings = Array.from(parent.children).filter((c) => c.tagName === el.tagName)
  const idx = siblings.indexOf(el) + 1
  const suffix = siblings.length > 1 ? '[' + idx + ']' : ''
  return elementXPath(parent) + '/' + el.tagName.toLowerCase() + suffix
}

export function getXPathForNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const parent = node.parentElement
    if (!parent) return ''
    const textNodes = Array.from(parent.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE)
    const idx = textNodes.indexOf(node as Text) + 1
    return elementXPath(parent) + '/text()[' + idx + ']'
  }
  if (node.nodeType === Node.ELEMENT_NODE) return elementXPath(node as Element)
  return ''
}

export function getNodeByXPath(xpath: string): Node | null {
  if (!xpath) return null
  try {
    const res = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
    return res.singleNodeValue
  } catch {
    return null
  }
}
