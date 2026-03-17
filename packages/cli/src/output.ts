export type OutputWriter = (message: string) => void

type RecentWord = Readonly<{
  id: string
  term: string
  source: string
  discoveredAt: string
}>

type ServiceMeta = Readonly<{
  service: string
  status: string
  routes: string[]
}>

type CheckResult = Readonly<{
  exists: boolean
  term: string
  normalizedTerm: string
}>

type AddResult = Readonly<{
  created: boolean
  exists: boolean
  term?: string
  normalizedTerm?: string
  item?: RecentWord
}>

export function writeJson(writer: OutputWriter, payload: unknown) {
  writer(`${JSON.stringify(payload, null, 2)}\n`)
}

export function writeService(writer: OutputWriter, service: ServiceMeta) {
  writer(`Service: ${service.service}\n`)
  writer(`Status: ${service.status}\n`)

  if (service.routes.length === 0) {
    return
  }

  writer("Routes:\n")

  for (const route of service.routes) {
    writer(`- ${route}\n`)
  }
}

export function writeRecentWords(writer: OutputWriter, items: RecentWord[]) {
  if (items.length === 0) {
    writer("No recent discoveries found.\n")
    return
  }

  for (const [index, item] of items.entries()) {
    writer(
      `${index + 1}. ${item.term} | ${item.source} | ${new Date(item.discoveredAt).toISOString()}\n`
    )
  }
}

export function writeCheckResult(writer: OutputWriter, result: CheckResult) {
  const state = result.exists ? "found" : "missing"

  writer(`Term: ${result.term}\n`)
  writer(`Normalized: ${result.normalizedTerm}\n`)
  writer(`Status: ${state}\n`)
}

export function writeAddResult(writer: OutputWriter, result: AddResult) {
  if (result.created && result.item) {
    writer(`Added: ${result.item.term}\n`)
    writer(`Source: ${result.item.source}\n`)
    writer(`Discovered: ${new Date(result.item.discoveredAt).toISOString()}\n`)
    return
  }

  writer(
    `Already exists: ${result.normalizedTerm ?? result.term ?? "unknown"}\n`
  )
}

export function writeError(writer: OutputWriter, message: string) {
  writer(`Error: ${message}\n`)
}
