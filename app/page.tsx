import { api } from "@/lib/eden"

export default async function Page() {
  const [{ data: service }, { data: recentWords }] = await Promise.all([
    api.get(),
    api.words.recent.get(),
  ])

  return (
    <main className="min-h-svh bg-linear-to-b from-background via-background to-muted/40 px-6 py-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <section className="space-y-4">
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
            Elysia backend connected
          </p>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight">
              Discover Word
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              The Next.js app now shares a typed Elysia backend mounted at
              <code className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs">
                /api
              </code>
              for word discovery features.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-medium text-card-foreground">
              Recent discoveries
            </h2>
            <div className="mt-4 grid gap-3">
              {recentWords?.items.map((word) => (
                <article
                  key={word.term}
                  className="rounded-xl border bg-background/80 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium">{word.term}</h3>
                      <p className="text-xs text-muted-foreground">
                        {word.language} - {word.source}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {new Date(word.discoveredAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {word.note}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-medium text-card-foreground">
              API status
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Service</dt>
                <dd className="font-medium">{service?.service}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium capitalize">{service?.status}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Endpoints</dt>
                <dd className="font-mono text-xs leading-6 text-muted-foreground">
                  {service?.routes.join("\n")}
                </dd>
              </div>
            </dl>
          </aside>
        </section>
      </div>
    </main>
  )
}
