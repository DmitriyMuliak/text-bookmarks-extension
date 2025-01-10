import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Create a structured mock that matches the Chrome API hierarchy
const chromeMock = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    sendMessage: vi.fn(),
  },
}

// Use vi.stubGlobal - the idiomatic way in Vitest to mock global objects without 'any'
vi.stubGlobal('chrome', chromeMock)
