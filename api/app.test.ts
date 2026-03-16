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

  it("checks whether a word exists", async () => {
    const response = await app.fetch(
      new Request("http://localhost/api/words/check?term=serendipity")
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({
      term: "serendipity",
      normalizedTerm: "serendipity",
      exists: true,
    })
  })

  it("returns false when a word does not exist", async () => {
    const response = await app.fetch(
      new Request("http://localhost/api/words/check?term=not-in-db")
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({
      term: "not-in-db",
      normalizedTerm: "not-in-db",
      exists: false,
    })
  })

  it("adds a submitted word", async () => {
    const term = `Word Finder ${Date.now()}`

    const response = await app.fetch(
      new Request("http://localhost/api/words", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-discovery-source": "web",
        },
        body: JSON.stringify({ term }),
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({
      created: true,
      exists: false,
      item: {
        term,
        source: "web",
      },
    })
    expect(payload.item.discoveredAt).toEqual(expect.any(String))
  })

  it("falls back to api source when no implicit source is provided", async () => {
    const term = `API Finder ${Date.now()}`

    const response = await app.fetch(
      new Request("http://localhost/api/words", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ term }),
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({
      created: true,
      item: {
        term,
        source: "api",
      },
    })
  })

  it("rejects duplicate submitted words", async () => {
    const term = `Duplicate Finder ${Date.now()}`

    await app.fetch(
      new Request("http://localhost/api/words", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          term,
        }),
      })
    )

    const response = await app.fetch(
      new Request("http://localhost/api/words", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          term: `  ${term.toUpperCase()}  `,
        }),
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(409)
    expect(payload).toMatchObject({
      created: false,
      exists: true,
      term: term.toUpperCase(),
      normalizedTerm: term.toLowerCase(),
    })
  })
})
