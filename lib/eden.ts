import { treaty } from "@elysiajs/eden"

import type { App } from "@/api/app"
import { app } from "@/api/app"

export const api =
  typeof process !== "undefined"
    ? treaty(app).api
    : treaty<App>("http://localhost:3000").api
