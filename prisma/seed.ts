import { prisma } from "@/lib/prisma"

const seedDiscoveries = [
  {
    term: "serendipity",
    language: "English",
    discoveredAt: new Date("2026-03-10T08:30:00.000Z"),
    source: "Reader submissions",
    note: "A lucky find that fits the product's discovery theme.",
  },
  {
    term: "sonder",
    language: "English",
    discoveredAt: new Date("2026-03-11T13:15:00.000Z"),
    source: "Editorial curation",
    note: "A modern favorite for describing the depth of strangers.",
  },
  {
    term: "komorebi",
    language: "Japanese",
    discoveredAt: new Date("2026-03-12T17:45:00.000Z"),
    source: "Research notes",
    note: "Sunlight filtering through leaves; a strong candidate for featured words.",
  },
]

async function main() {
  const existingCount = await prisma.discovery.count()

  if (existingCount > 0) {
    return
  }

  await prisma.discovery.createMany({
    data: seedDiscoveries,
  })
}

main()
  .catch((error: unknown) => {
    console.error("Failed to seed Prisma database", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
