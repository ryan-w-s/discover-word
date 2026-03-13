import { Elysia, t } from "elysia"

import { analyzeWord, recentDiscoveries } from "@/api/discoveries"

export const app = new Elysia({ prefix: "/api" })
  .get("/", () => ({
    service: "discover-word-api",
    status: "ok",
    routes: ["GET /api", "GET /api/words/recent", "POST /api/words/analyze"],
  }))
  .get("/words/recent", () => ({
    items: recentDiscoveries,
    count: recentDiscoveries.length,
  }))
  .post("/words/analyze", ({ body }) => analyzeWord(body.term), {
    body: t.Object({
      term: t.String({ minLength: 1 }),
    }),
  })

export type App = typeof app
