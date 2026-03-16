import { prisma } from "@/lib/prisma"

type DiscoveryRecord = Awaited<ReturnType<typeof prisma.discovery.findFirst>>

type AddWordInput = Readonly<{
  term: string
  source?: string
}>

function normalizeTerm(term: string) {
  return term.trim().toLowerCase()
}

function serializeDiscovery(item: NonNullable<DiscoveryRecord>) {
  return {
    ...item,
    discoveredAt: item.discoveredAt.toISOString(),
  }
}

export async function listRecentWords() {
  const items = await prisma.discovery.findMany({
    orderBy: {
      discoveredAt: "desc",
    },
    take: 10,
  })

  return items.map(serializeDiscovery)
}

export async function checkWord(term: string) {
  const normalizedTerm = normalizeTerm(term)

  const items = await prisma.discovery.findMany({
    select: {
      id: true,
      term: true,
    },
  })

  const match = items.find(
    (item) => normalizeTerm(item.term) === normalizedTerm
  )

  return {
    exists: Boolean(match),
    term,
    normalizedTerm,
  }
}

export async function addWord(input: AddWordInput) {
  const term = input.term.trim()
  const normalizedTerm = normalizeTerm(input.term)

  const existing = await checkWord(term)

  if (existing.exists) {
    return {
      created: false,
      exists: true,
      term,
      normalizedTerm,
    }
  }

  const item = await prisma.discovery.create({
    data: {
      term,
      source: input.source?.trim() || "User submission",
    },
  })

  return {
    created: true,
    exists: false,
    item: serializeDiscovery(item),
  }
}
