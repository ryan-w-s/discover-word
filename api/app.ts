import { Elysia, t } from "elysia"

import { addWord, checkWord, listRecentWords } from "@/api/discoveries"

function resolveSubmissionSource(headers: Record<string, string | undefined>) {
  const source = headers["x-discovery-source"]?.trim().toLowerCase()

  return source || "api"
}

export const app = new Elysia({ prefix: "/api" })
  .get("/", () => ({
    service: "discover-word-api",
    status: "ok",
    routes: [
      "GET /api",
      "POST /api/words",
      "GET /api/words/check?term=...",
      "GET /api/words/recent",
    ],
  }))
  .get("/words/recent", async () => {
    const items = await listRecentWords()

    return {
      items,
      count: items.length,
    }
  })
  .get("/words/check", ({ query }) => checkWord(query.term), {
    query: t.Object({
      term: t.String({ minLength: 1 }),
    }),
  })
  .post(
    "/words",
    async ({ body, headers, set }) => {
      const result = await addWord({
        term: body.term,
        source: resolveSubmissionSource(headers),
      })

      if (!result.created) {
        set.status = 409
      }

      return result
    },
    {
      body: t.Object({
        term: t.String({ minLength: 1 }),
      }),
    }
  )

export type App = typeof app
