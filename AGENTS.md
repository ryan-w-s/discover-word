# AGENTS.md

Guidance for coding agents working in `discover-word`.

## Project Snapshot

- Current repo: early Next.js 16 + React 19 + TypeScript frontend scaffold.
- UI stack: shadcn/ui, Radix primitives, Tailwind CSS v4, `class-variance-authority`, `next-themes`.
- Package manager: Bun is present via `bun.lock` and should be the default runner.
- TypeScript is `strict` and uses the `@/*` path alias from `tsconfig.json`.
- Formatting is Prettier-driven with `prettier-plugin-tailwindcss`.
- Linting uses ESLint with Next.js Core Web Vitals and TypeScript presets.
- Testing uses Vitest with the `jsdom` environment.
- No Cursor rules exist in `.cursor/rules/` or `.cursorrules`.
- No Copilot instructions exist in `.github/copilot-instructions.md`.

## Product Direction

Build toward a word discovery service with a Next.js + shadcn frontend, an Elysia backend, an MCP server, and a CLI for agents.
Prefer changes that keep those boundaries easy to introduce even if the repo is not there yet.

## Repository Layout

- `app/`: App Router pages, layout, and global styles.
- `components/`: reusable UI; `components/ui/` holds shadcn-style primitives.
- `lib/`: framework-agnostic helpers such as `cn()`.
- `hooks/`: custom React hooks.
- `public/`: static assets.
- Future-friendly additions: `server/` or `packages/api/`, `packages/mcp/`, `packages/cli/`, and `tests/` or colocated `*.test.ts(x)` files.

## Install And Run

Use Bun unless the repo later standardizes on something else.

```bash
bun install
bun run dev
```

Core commands:

- `bun run dev` - start Next.js dev server with Turbopack.
- `bun run build` - create the production build.
- `bun run start` - serve the production build.
- `bun run lint` - run ESLint across the repo.
- `bun run test` - start Vitest in watch mode.
- `bun run test:run` - run Vitest once.
- `bun run typecheck` - run `tsc --noEmit`.
- `bun run format` - format `**/*.{ts,tsx}` with Prettier.

Verified working when this file was written:

- `bun run lint`
- `bun run test:run`
- `bun run typecheck`
- `bun run build`

## Tests

Vitest is installed and available through `bun run test` and `bun run test:run`.
Single-test commands:

- Bun file test: `bun test path/to/file.test.ts`
- Bun named test: `bun test --test-name-pattern "name"`
- Vitest file test: `bunx vitest run path/to/file.test.ts`
- Vitest named test: `bunx vitest run path/to/file.test.ts -t "name"`

## Standard Verification

Before finishing a non-trivial change, run:

```bash
bun run lint && bun run test:run && bun run typecheck && bun run build
```

## Code Style

### General

- Follow existing repository patterns before applying generic preferences.
- Keep files small and focused.
- Prefer simple code over clever abstractions.
- Use guard clauses and early returns to reduce nesting.
- Add comments only when intent is not obvious from code.

### Formatting

Prettier is authoritative:

- 2-space indentation.
- no semicolons.
- double quotes.
- trailing commas where valid in ES5.
- max width 80.
- LF line endings.
- Tailwind classes auto-sorted by `prettier-plugin-tailwindcss`.
  Prefer running the formatter over hand-formatting class strings.

### Imports

- Use `@/` absolute imports for app code.
- Prefer import groups in this order: external packages, blank line, internal aliases.
- Keep side-effect imports explicit and near the top of the file.
- Use `import type` when it improves clarity; inline `type` specifiers are also acceptable.
- Avoid deep relative paths when `@/` works.

### TypeScript

- Preserve `strict` compatibility.
- Avoid `any`; use concrete types, unions, generics, or `unknown` with narrowing.
- Prefer inference for obvious local values.
- Add explicit types to exported functions, shared utilities, and complex shapes when helpful.
- Use `Readonly<...>` for immutable prop objects when appropriate.
- Prefer narrow prop types over broad bags of optional values.
- Keep generic helpers in `lib/` when they do not need React or Next.js.

### React And Next.js

- Use function components.
- Default export page and layout modules in `app/`.
- Prefer named exports for reusable components and utilities outside route modules.
- Add `"use client"` only when a file truly needs client-only state, effects, or browser APIs.
- Favor server components by default once real data fetching is added.
- Keep route files thin; move reusable UI and logic into `components/` and `lib/`.
- When a component supports variants, follow the `cva` pattern used in `components/ui/button.tsx`.

### Styling

- Use Tailwind utility classes for component styling.
- Use `cn()` from `@/lib/utils` to merge classes.
- Prefer tokens and CSS variables from `app/globals.css` over raw hard-coded colors.
- Reuse shadcn primitives before building custom low-level controls.
- Stay aligned with the current neutral token system unless the task intentionally changes design direction.
- Let Prettier sort Tailwind classes.

### Naming

- Components: `PascalCase`.
- Hooks: `camelCase` and start with `use`.
- Utilities and functions: `camelCase`.
- Route files: Next.js conventions such as `page.tsx` and `layout.tsx`.
- Constants: `UPPER_SNAKE_CASE` only for true shared constants.
- Prefer descriptive domain names like `wordSubmission`, `recentDiscoveries`, and `searchQuery`.

### Error Handling

- Do not swallow errors silently.
- Validate at the boundary of each feature.
- In UI code, surface recoverable failures in a user-friendly way.
- In future server or CLI code, prefer typed results or intentional domain errors over ad hoc strings.
- Add context when logging or rethrowing errors.
- Validate request inputs, params, and environment variables early.

### Accessibility

- Use semantic HTML first.
- Preserve keyboard behavior and focus visibility.
- Prefer Radix/shadcn primitives for accessible interactions.
- Ensure icon-only controls have accessible labels.

## Agent Guidance

- Check existing patterns before creating new ones.
- Avoid broad refactors unless the task requires them.
- Do not edit generated or ignored output such as `.next/`, `build/`, or `out/`.
- When adding dependencies, prefer small, well-maintained libraries with clear value.
- If you introduce Elysia, MCP, or CLI packages, add matching scripts for build, lint, and tests.
- If you add tests, update both `package.json` and this file with exact single-test commands.

## Current Gaps

- No backend exists yet.
- No MCP server exists yet.
- No CLI exists yet.
- Vitest is configured, but test coverage and UI/component testing helpers are not added yet.
- No domain model for words, submissions, search, or recency exists yet.
  Treat the current repo as a clean frontend foundation and extend it deliberately.
