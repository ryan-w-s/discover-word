"use client"

import type { FormEvent, ReactNode } from "react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ServiceMeta = Readonly<{
  service: string
  status: string
  routes: string[]
}>

type RecentWord = Readonly<{
  id: string
  term: string
  source: string
  discoveredAt: string
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

type WordStudioProps = Readonly<{
  service: ServiceMeta
  initialRecentWords: RecentWord[]
}>

const EMPTY_ADD_FORM = {
  term: "",
}

export function WordStudio({ service, initialRecentWords }: WordStudioProps) {
  const [recentWords, setRecentWords] = useState(initialRecentWords)
  const [checkTerm, setCheckTerm] = useState("")
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null)
  const [checkError, setCheckError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM)
  const [addResult, setAddResult] = useState<AddResult | null>(null)
  const [addError, setAddError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const existingCount = useMemo(() => recentWords.length, [recentWords])

  async function handleCheckSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const term = checkTerm.trim()

    if (!term) {
      setCheckError("Enter a word to check.")
      setCheckResult(null)
      return
    }

    setIsChecking(true)
    setCheckError(null)

    try {
      const response = await fetch(
        `/api/words/check?term=${encodeURIComponent(term)}`
      )

      if (!response.ok) {
        throw new Error("Unable to check this word right now.")
      }

      const payload = (await response.json()) as CheckResult

      setCheckResult(payload)
    } catch (error) {
      setCheckResult(null)
      setCheckError(
        error instanceof Error
          ? error.message
          : "Unable to check this word right now."
      )
    } finally {
      setIsChecking(false)
    }
  }

  async function handleAddSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const term = addForm.term.trim()

    if (!term) {
      setAddError("Enter a word to add.")
      setAddResult(null)
      return
    }

    setIsAdding(true)
    setAddError(null)

    try {
      const response = await fetch("/api/words", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-discovery-source": "web",
        },
        body: JSON.stringify({ term }),
      })

      const payload = (await response.json()) as AddResult

      if (response.status === 409) {
        setAddResult(payload)
        return
      }

      if (!response.ok) {
        throw new Error("Unable to add this word right now.")
      }

      setAddResult(payload)

      if (payload.item) {
        const item = payload.item

        setRecentWords((current) => [item, ...current].slice(0, 10))
      }

      setAddForm(EMPTY_ADD_FORM)
    } catch (error) {
      setAddResult(null)
      setAddError(
        error instanceof Error
          ? error.message
          : "Unable to add this word right now."
      )
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <main className="min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(191,219,254,0.45),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_24%),linear-gradient(to_bottom,transparent,rgba(148,163,184,0.08))] px-6 py-10 md:py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
          <div className="rounded-3xl border bg-card/90 p-7 shadow-sm backdrop-blur md:p-8">
            <p className="font-mono text-xs tracking-[0.32em] text-muted-foreground uppercase">
              Discover Word registry
            </p>
            <div className="mt-4 space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
                Add fresh finds, verify duplicates, and watch the newest words
                roll in.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                This screen talks directly to the Elysia API mounted at
                <code className="ml-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  /api
                </code>
                and keeps the most recent discoveries in sync after each
                submission.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <MetricCard
                label="Known now"
                value={String(existingCount).padStart(2, "0")}
                hint="Recent words loaded"
              />
              <MetricCard
                label="Write path"
                value="POST"
                hint="Submit new discoveries"
              />
              <MetricCard
                label="Lookup path"
                value="CHECK"
                hint="True/false existence query"
              />
            </div>
          </div>

          <aside className="rounded-3xl border bg-card/85 p-6 shadow-sm backdrop-blur">
            <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
              API status
            </p>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Service</dt>
                <dd className="mt-1 font-medium">{service.service}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="mt-1 inline-flex rounded-full border px-2 py-1 text-xs font-medium uppercase">
                  {service.status}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Routes</dt>
                <dd className="mt-2 space-y-2 font-mono text-xs text-muted-foreground">
                  {service.routes.map((route) => (
                    <div
                      key={route}
                      className="rounded-xl bg-muted/70 px-3 py-2"
                    >
                      {route}
                    </div>
                  ))}
                </dd>
              </div>
            </dl>
          </aside>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="grid gap-6">
            <Panel
              eyebrow="Add a word"
              title="Create a fresh discovery entry"
              description="Submit a term straight from the web app into the registry."
            >
              <form className="space-y-4" onSubmit={handleAddSubmit}>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Term</span>
                  <input
                    value={addForm.term}
                    onChange={(event) =>
                      setAddForm((current) => ({
                        ...current,
                        term: event.target.value,
                      }))
                    }
                    placeholder="petrichor"
                    className="h-12 w-full rounded-2xl border bg-background px-4 text-sm shadow-sm transition outline-none focus:border-foreground/30 focus:ring-4 focus:ring-muted"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" size="lg" disabled={isAdding}>
                    {isAdding ? "Adding..." : "Add word"}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Source is assigned automatically as `web` from this UI.
                  </span>
                </div>
              </form>

              {addError ? (
                <StatusCard tone="error">{addError}</StatusCard>
              ) : null}

              {addResult ? (
                <StatusCard tone={addResult.created ? "success" : "warning"}>
                  {addResult.created && addResult.item ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {addResult.item.term}
                        </span>
                        <span className="rounded-full bg-background/80 px-2 py-1 text-xs">
                          saved
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Added to the registry and inserted into the recent words
                        list immediately.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="font-medium">Already exists</div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {addResult.normalizedTerm} is already present, so no new
                        record was created.
                      </p>
                    </>
                  )}
                </StatusCard>
              ) : null}
            </Panel>

            <Panel
              eyebrow="Check a word"
              title="Find out if a term already exists"
              description="Run a fast true/false lookup before you submit something new."
            >
              <form className="space-y-4" onSubmit={handleCheckSubmit}>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Word or phrase</span>
                  <input
                    value={checkTerm}
                    onChange={(event) => setCheckTerm(event.target.value)}
                    placeholder="serendipity"
                    className="h-12 w-full rounded-2xl border bg-background px-4 text-sm shadow-sm transition outline-none focus:border-foreground/30 focus:ring-4 focus:ring-muted"
                  />
                </label>

                <div className="flex items-center gap-3">
                  <Button type="submit" size="lg" disabled={isChecking}>
                    {isChecking ? "Checking..." : "Check word"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Normalized with trim + lowercase before lookup.
                  </p>
                </div>
              </form>

              {checkError ? (
                <StatusCard tone="error">{checkError}</StatusCard>
              ) : null}

              {checkResult ? (
                <StatusCard tone={checkResult.exists ? "success" : "info"}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{checkResult.term}</span>
                    <span className="text-muted-foreground">-&gt;</span>
                    <code className="rounded bg-background/80 px-2 py-1 font-mono text-xs">
                      {checkResult.normalizedTerm}
                    </code>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {checkResult.exists
                      ? "Already in the registry."
                      : "Not found yet - you can add it now."}
                  </p>
                </StatusCard>
              ) : null}
            </Panel>
          </div>

          <Panel
            eyebrow="Recent words"
            title="Newest discoveries in the registry"
            description="The feed starts from the server response and updates locally after successful submissions."
          >
            <div className="grid gap-3">
              {recentWords.map((word, index) => (
                <article
                  key={word.id}
                  className="rounded-2xl border bg-background/80 p-4 shadow-sm transition hover:-translate-y-0.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                          #{String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="text-lg font-medium">{word.term}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {word.source}
                      </p>
                    </div>

                    <time className="rounded-full bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
                      {new Date(word.discoveredAt).toLocaleDateString()}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  )
}

function MetricCard({
  label,
  value,
  hint,
}: Readonly<{
  label: string
  value: string
  hint: string
}>) {
  return (
    <div className="rounded-2xl border bg-background/75 p-4 shadow-sm">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

function Panel({
  eyebrow,
  title,
  description,
  children,
}: Readonly<{
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}>) {
  return (
    <section className="rounded-3xl border bg-card/90 p-6 shadow-sm backdrop-blur md:p-7">
      <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
        {eyebrow}
      </p>
      <div className="mt-3 space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function StatusCard({
  tone,
  children,
}: Readonly<{
  tone: "success" | "warning" | "error" | "info"
  children: ReactNode
}>) {
  return (
    <div
      className={cn(
        "mt-4 rounded-2xl border px-4 py-3",
        tone === "success" && "border-emerald-200 bg-emerald-50/80",
        tone === "warning" && "border-amber-200 bg-amber-50/80",
        tone === "error" && "border-red-200 bg-red-50/80",
        tone === "info" && "border-sky-200 bg-sky-50/80"
      )}
    >
      {children}
    </div>
  )
}
