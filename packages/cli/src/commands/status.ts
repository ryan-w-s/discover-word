import { writeJson, writeService } from "../output"

import type { CliRuntime } from "../index"

export async function runStatus(runtime: CliRuntime) {
  const service = await runtime.api.getStatus()

  if (runtime.options.json) {
    writeJson(runtime.stdout, service)
    return
  }

  writeService(runtime.stdout, service)
}
