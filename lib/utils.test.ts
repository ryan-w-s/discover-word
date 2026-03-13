import { describe, expect, it } from "vitest"

import { cn } from "@/lib/utils"

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("alpha", false && "beta", "gamma")).toBe("alpha gamma")
  })

  it("merges conflicting tailwind utilities", () => {
    expect(cn("px-2 text-sm", "px-4")).toBe("text-sm px-4")
  })
})
