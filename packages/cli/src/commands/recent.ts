import { writeJson, writeRecentWords } from "../output"

import type { CliRuntime } from "../index"

function parseLimit(limit: string) {
  const value = Number.parseInt(limit, 10)

  if (!Number.isInteger(value) || value < 1) {
    throw new Error("Limit must be a positive integer.")
  }

  return value
}

export function parseRecentLimit(limit: string) {
  return parseLimit(limit)
}

export async function runRecent(runtime: CliRuntime, limit?: number) {
  const recentWords = await runtime.api.getRecentWords()
  const items = limit ? recentWords.items.slice(0, limit) : recentWords.items
  const payload = {
    ...recentWords,
    items,
    count: items.length,
  }

  if (runtime.options.json) {
    writeJson(runtime.stdout, payload)
    return
  }

  writeRecentWords(runtime.stdout, payload.items)
}
