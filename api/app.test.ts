import { describe, expect, it } from "vitest"

import { app } from "@/api/app"

describe("api app", () => {
  it("returns service metadata from the root endpoint", async () => {
    const response = await app.fetch(new Request("http://localhost/api"))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({
      service: "discover-word-api",
      status: "ok",
    })
  })

  it("returns recent words", async () => {
    const response = await app.fetch(
      new Request("http://localhost/api/words/recent")
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.count).toBeGreaterThan(0)
    expect(payload.items[0]).toMatchObject({
      term: expect.any(String),
      source: expect.any(String),
    })
  })

  it("analyzes a submitted word", async () => {
    const response = await app.fetch(
      new Request("http://localhost/api/words/analyze", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ term: "Word Finder" }),
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({
      normalizedTerm: "word finder",
      slug: "word-finder",
      hasWhitespace: true,
    })
  })
})
