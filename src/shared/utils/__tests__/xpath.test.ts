import { describe, it, expect, beforeEach } from 'vitest'
import { getXPathForNode, getNodeByXPath } from '../xpath'

describe('XPath Utilities', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="root">
        <p>First paragraph</p>
        <div class="container">
          <span>Target <b>Bold</b> Text</span>
          <span>Another span</span>
        </div>
      </div>
    `
  })

  it('should generate correct XPath for a simple element', () => {
    const p = document.querySelector('p')!
    const xpath = getXPathForNode(p)
    expect(xpath).toBe('/html/body/div/p')
    expect(getNodeByXPath(xpath)).toBe(p)
  })

  it('should handle sibling elements with same tag', () => {
    const spans = document.querySelectorAll('span')
    const secondSpan = spans[1]
    const xpath = getXPathForNode(secondSpan)
    expect(xpath).toBe('/html/body/div/div/span[2]')
    expect(getNodeByXPath(xpath)).toBe(secondSpan)
  })

  it('should generate correct XPath for text nodes', () => {
    const bold = document.querySelector('b')!
    const textNode = bold.firstChild!
    const xpath = getXPathForNode(textNode)
    expect(xpath).toContain('/b/text()[1]')
    expect(getNodeByXPath(xpath)).toBe(textNode)
  })

  it('should handle complex nested text nodes', () => {
    const container = document.querySelector('.container')!
    const span = container.querySelector('span')!
    const lastTextNode = span.childNodes[2]
    expect(lastTextNode.nodeType).toBe(Node.TEXT_NODE)
    const xpath = getXPathForNode(lastTextNode)
    expect(xpath).toBe('/html/body/div/div/span[1]/text()[2]')
    expect(getNodeByXPath(xpath)).toBe(lastTextNode)
  })

  it('should return null for invalid XPaths', () => {
    expect(getNodeByXPath('/html/body/invalid/path')).toBeNull()
    expect(getNodeByXPath('')).toBeNull()
  })
})
