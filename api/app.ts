import { Elysia, t } from "elysia"

import { analyzeWord, listRecentDiscoveries } from "@/api/discoveries"

export const app = new Elysia({ prefix: "/api" })
  .get("/", () => ({
    service: "discover-word-api",
    status: "ok",
    routes: ["GET /api", "GET /api/words/recent", "POST /api/words/analyze"],
  }))
  .get("/words/recent", async () => {
    const items = await listRecentDiscoveries()

    return {
      items,
      count: items.length,
    }
  })
  .post("/words/analyze", ({ body }) => analyzeWord(body.term), {
    body: t.Object({
      term: t.String({ minLength: 1 }),
    }),
  })

export type App = typeof app
