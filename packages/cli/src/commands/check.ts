import { writeCheckResult, writeJson } from "../output"

import type { CliRuntime } from "../index"

export async function runCheck(runtime: CliRuntime, term: string) {
  const result = await runtime.api.checkWord(term)

  if (runtime.options.json) {
    writeJson(runtime.stdout, result)
    return
  }

  writeCheckResult(runtime.stdout, result)
}
