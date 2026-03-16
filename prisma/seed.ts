import { prisma } from "@/lib/prisma"

const seedDiscoveries = [
  {
    term: "serendipity",
    discoveredAt: new Date("2026-03-10T08:30:00.000Z"),
    source: "Reader submissions",
  },
  {
    term: "sonder",
    discoveredAt: new Date("2026-03-11T13:15:00.000Z"),
    source: "Editorial curation",
  },
  {
    term: "komorebi",
    discoveredAt: new Date("2026-03-12T17:45:00.000Z"),
    source: "Research notes",
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
