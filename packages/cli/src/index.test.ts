import { describe, expect, it, vi } from "vitest"

import { DEFAULT_DISCOVERY_SOURCE } from "./client"
import { run } from "./index"

import type {
  AddWordResponse,
  ApiClient,
  CheckWordResponse,
  RecentWordsResponse,
  ServiceMeta,
} from "./client"

function createMockApiClient(overrides: Partial<ApiClient> = {}): ApiClient {
  const service: ServiceMeta = {
    service: "discover-word-api",
    status: "ok",
    routes: ["GET /api"],
  }

  const recentWords: RecentWordsResponse = {
    items: [
      {
        id: "1",
        term: "serendipity",
        source: "seed",
        discoveredAt: "2026-03-17T00:00:00.000Z",
      },
      {
        id: "2",
        term: "petrichor",
        source: "seed",
        discoveredAt: "2026-03-16T00:00:00.000Z",
      },
    ],
    count: 2,
  }

  const checkWord: CheckWordResponse = {
    exists: true,
    term: "serendipity",
    normalizedTerm: "serendipity",
  }

  const addWord: AddWordResponse = {
    created: true,
    exists: false,
    item: {
      id: "3",
      term: "sonder",
      source: DEFAULT_DISCOVERY_SOURCE,
      discoveredAt: "2026-03-17T00:00:00.000Z",
    },
  }

  return {
    getStatus: vi.fn(async () => service),
    getRecentWords: vi.fn(async () => recentWords),
    checkWord: vi.fn(async () => checkWord),
    addWord: vi.fn(async () => addWord),
    ...overrides,
  }
}

function createWriters() {
  let stdout = ""
  let stderr = ""

  return {
    stdout: (message: string) => {
      stdout += message
    },
    stderr: (message: string) => {
      stderr += message
    },
    getStdout: () => stdout,
    getStderr: () => stderr,
  }
}

describe("discover-word cli", () => {
  it("prints service metadata for status", async () => {
    const api = createMockApiClient()
    const writers = createWriters()

    const exitCode = await run(["status"], {
      apiFactory: () => api,
      stdout: writers.stdout,
      stderr: writers.stderr,
    })

    expect(exitCode).toBe(0)
    expect(writers.getStdout()).toContain("Service: discover-word-api")
    expect(writers.getStderr()).toBe("")
  })

  it("prints recent words as json", async () => {
    const api = createMockApiClient()
    const writers = createWriters()

    const exitCode = await run(["--json", "recent", "--limit", "1"], {
      apiFactory: () => api,
      stdout: writers.stdout,
      stderr: writers.stderr,
    })

    expect(exitCode).toBe(0)
    expect(JSON.parse(writers.getStdout())).toMatchObject({
      count: 1,
      items: [{ term: "serendipity" }],
    })
  })

  it("passes the selected source to add", async () => {
    const api = createMockApiClient()
    const writers = createWriters()

    const exitCode = await run(["add", "sonder", "--source", "agent"], {
      apiFactory: () => api,
      stdout: writers.stdout,
      stderr: writers.stderr,
    })

    expect(exitCode).toBe(0)
    expect(api.addWord).toHaveBeenCalledWith("sonder", "agent")
    expect(writers.getStdout()).toContain("Added: sonder")
  })

  it("reports command validation errors", async () => {
    const api = createMockApiClient()
    const writers = createWriters()

    const exitCode = await run(["recent", "--limit", "0"], {
      apiFactory: () => api,
      stdout: writers.stdout,
      stderr: writers.stderr,
    })

    expect(exitCode).toBe(1)
    expect(writers.getStderr()).toContain("Limit must be a positive integer.")
  })
})
