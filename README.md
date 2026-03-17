# Discover Word

Discover Word is a Next.js frontend with an Elysia API mounted under `/api`.

## Development

```bash
bun install
bun run dev
```

## Commander CLI

The repo now includes a Commander-based CLI in `packages/cli`.

```bash
bun run cli -- status
bun run cli -- recent --limit 5
bun run cli -- check serendipity
bun run cli -- add petrichor --source cli
```

Set `DISCOVER_WORD_API_URL` to point the CLI at another environment. It
defaults to `http://localhost:3000`.

## Tests

```bash
bun run test:run
bun run cli:test
```
