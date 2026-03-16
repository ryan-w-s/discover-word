import { api } from "@/lib/eden"
import { WordStudio } from "@/components/word-studio"

export default async function Page() {
  const [{ data: service }, { data: recentWords }] = await Promise.all([
    api.get(),
    api.words.recent.get(),
  ])

  if (!service || !recentWords) {
    throw new Error("Unable to load word studio data.")
  }

  return <WordStudio service={service} initialRecentWords={recentWords.items} />
}
