export type Discovery = {
  term: string
  language: string
  discoveredAt: string
  source: string
  note: string
}

export const recentDiscoveries: Discovery[] = [
  {
    term: "serendipity",
    language: "English",
    discoveredAt: "2026-03-10T08:30:00.000Z",
    source: "Reader submissions",
    note: "A lucky find that fits the product's discovery theme.",
  },
  {
    term: "sonder",
    language: "English",
    discoveredAt: "2026-03-11T13:15:00.000Z",
    source: "Editorial curation",
    note: "A modern favorite for describing the depth of strangers.",
  },
  {
    term: "komorebi",
    language: "Japanese",
    discoveredAt: "2026-03-12T17:45:00.000Z",
    source: "Research notes",
    note: "Sunlight filtering through leaves; a strong candidate for featured words.",
  },
]

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
