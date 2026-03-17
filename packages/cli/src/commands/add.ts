import { DEFAULT_DISCOVERY_SOURCE } from "../client"
import { writeAddResult, writeJson } from "../output"

import type { CliRuntime } from "../index"

export async function runAdd(
  runtime: CliRuntime,
  term: string,
  source = DEFAULT_DISCOVERY_SOURCE
) {
  const result = await runtime.api.addWord(term, source)

  if (runtime.options.json) {
    writeJson(runtime.stdout, result)
    return
  }

  writeAddResult(runtime.stdout, result)
}
