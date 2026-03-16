import { prisma } from "@/lib/prisma"

export async function listRecentDiscoveries() {
  const items = await prisma.discovery.findMany({
    orderBy: {
      discoveredAt: "desc",
    },
    take: 10,
  })

  return items.map((item) => ({
    ...item,
    discoveredAt: item.discoveredAt.toISOString(),
  }))
}

export function analyzeWord(term: string) {
  const normalizedTerm = term.trim().toLowerCase()

  return {
    term,
    normalizedTerm,
    slug: normalizedTerm.replace(/\s+/g, "-"),
    length: normalizedTerm.length,
    hasWhitespace: /\s/.test(term),
    suggestedLookupPath: `/words/${normalizedTerm.replace(/\s+/g, "-")}`,
  }
}
