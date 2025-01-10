import { describe, it, expect, vi, beforeEach } from 'vitest'
import { storageService } from '../storage'
import { STORAGE_KEY } from '../../constants'
import { SavedSnippet } from '../../types'

describe('Storage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty array if no snippets found', async () => {
    vi.mocked(chrome.storage.local.get).mockResolvedValue({} as never)

    const snippets = await storageService.getAll()
    expect(snippets).toEqual([])
    expect(chrome.storage.local.get).toHaveBeenCalledWith(STORAGE_KEY)
  })

  it('should add a new snippet correctly', async () => {
    const mockExisting: SavedSnippet[] = []

    vi.mocked(chrome.storage.local.get).mockImplementation(async () => ({
      [STORAGE_KEY]: { snippets: mockExisting, version: 1 },
    }))

    const payload = {
      title: 'Test',
      text: 'Hello',
      url: 'https://test.com',
      domain: 'test.com',
      xpath: '/p',
      startOffset: 0,
      endXpath: '/p',
      endOffset: 5,
      scrollY: 100,
    }

    const result = await storageService.addSnippet(payload)

    expect(result.id).toBeDefined()
    expect(result.title).toBe(payload.title)
    expect(chrome.storage.local.set).toHaveBeenCalled()
  })

  it('should update a snippet title', async () => {
    const mockSnippet: SavedSnippet = {
      id: '123',
      title: 'Old',
      text: '',
      url: '',
      domain: '',
      xpath: '',
      startOffset: 0,
      endXpath: '',
      endOffset: 0,
      scrollY: 0,
      createdAt: 0,
    }

    vi.mocked(chrome.storage.local.get).mockImplementation(async () => ({
      [STORAGE_KEY]: { snippets: [mockSnippet], version: 1 },
    }))

    await storageService.updateTitle('123', 'New')

    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        [STORAGE_KEY]: expect.objectContaining({
          snippets: [expect.objectContaining({ id: '123', title: 'New' })],
        }),
      }),
    )
  })

  it('should delete a snippet', async () => {
    const mockSnippets: SavedSnippet[] = [
      {
        id: '1',
        title: '',
        text: '',
        url: '',
        domain: '',
        xpath: '',
        startOffset: 0,
        endXpath: '',
        endOffset: 0,
        scrollY: 0,
        createdAt: 0,
      },
      {
        id: '2',
        title: '',
        text: '',
        url: '',
        domain: '',
        xpath: '',
        startOffset: 0,
        endXpath: '',
        endOffset: 0,
        scrollY: 0,
        createdAt: 0,
      },
    ]

    vi.mocked(chrome.storage.local.get).mockImplementation(async () => ({
      [STORAGE_KEY]: { snippets: mockSnippets, version: 1 },
    }))

    await storageService.deleteSnippet('1')

    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        [STORAGE_KEY]: expect.objectContaining({
          snippets: [expect.objectContaining({ id: '2' })],
        }),
      }),
    )
  })
})
