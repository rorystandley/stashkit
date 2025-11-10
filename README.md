# StashKit

StashKit is a modern, dependency-free wrapper around the Web Storage API that adds TTL, namespacing, graceful fallbacks, and a clean developer-centric API. It exists for teams that need the ergonomics of purpose-built storage utilities without pulling in heavy, unmaintained libraries.

---

## Why
- **Smarter persistence** – built‑in TTLs, deterministic cleanup, and namespaced keys eliminate boilerplate.
- **Tiny & tree‑shakable** – no dependencies, designed for modern bundlers, <5 KB target.
- **Predictable** – consistent JSON serialization, error handling, and fallbacks in environments where `localStorage` is blocked (Safari Private Mode, SSR, tests).
- **TypeScript-first** – strict typings and generics for strong compile-time guarantees.

---

## Installation

```bash
npm install stashkit
# or
yarn add stashkit
```

---

## Quick Start

```ts
import { createStore } from "stashkit";

const store = createStore({
  namespace: "app",
  defaultTTL: 3600, // seconds
});

store.set("user", { id: 42, name: "Sky" });
const user = store.get<{ id: number; name: string }>("user");

store.set("token", "abc123", { ttl: 30 }); // per-key TTL

store.remove("token");
store.clear(); // clears only keys with the namespace prefix
```

---

## API Surface

### `createStore(options?)`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `namespace` | `string` | `"lsp"` | Prefix added to every persisted key (e.g. `lsp:user`). |
| `defaultTTL` | `number` | `undefined` | TTL (seconds) automatically applied when a per-key TTL isn’t provided. |
| `storage` | `StorageLike` | `localStorage` | Custom storage adapter (e.g. `sessionStorage` or a mocked storage). |
| `serialize` / `deserialize` | `(value) => string` / `(raw) => unknown` | `JSON.stringify` / `JSON.parse` | Override serialization for custom formats. |

#### Provided Store Methods
- `set(key, value, options?)` – persists structured data with optional `{ ttl }`.
- `get(key)` – retrieves parsed data, pruning expired keys automatically.
- `remove(key)` – deletes a single namespaced key.
- `clear()` – deletes all keys managed under the namespace.

Expired entries are cleaned up lazily when `get` detects an expired payload. `clear` operates only on tracked keys, so other data in `localStorage` is untouched.

### Error Handling
If native storage isn’t usable (exceptions thrown on `setItem`/`removeItem`), StashKit transparently falls back to an in-memory store and logs a warning (`StorageUnavailableError`). You can supply your own storage adapter to avoid console noise in constrained environments (SSR tests, etc.).

---

## Development

| Script | Purpose |
| --- | --- |
| `npm run build` | Compile TypeScript sources into `dist/`. |
| `npm run test` | Run the Vitest suite locally (fast, no coverage). |
| `npm run test:ci` | CI-friendly Vitest run with V8 coverage output. |
| `npm run test:coverage` | Alias for `test:ci` for local coverage checks. |
| `npm run lint` | ESLint with type-aware rules against `src/` and `tests/`. |
| `npm run docs` | Generate API reference via TypeDoc into `docs/api/`. |
| `npm run clean` | Remove the generated `dist/` directory. |
| `npm run changeset` | Create a new Changeset (changelog + version bump metadata). |
| `npm run version-packages` | Apply pending Changesets to bump versions/changelog locally. |
| `npm run release` | Publish the package using Changesets (runs `changeset publish`). |
| `npm run playground` | Optional helper to serve the browser playground (see below). |

### Running Tests with Coverage
```bash
npm run test:ci
# coverage reports land in ./coverage (text + lcov)
```

### Linting
```bash
npm run lint
```

CI (GitHub Actions) installs dependencies, lints, runs `npm run test:ci`, and builds on pushes/PRs targeting `main` or `develop`.

### Browser Playground
For quick manual testing in a real browser:
1. Run:
   ```bash
   npm run playground
   ```
   This builds the library, copies the emitted `dist/index.js` into `playground/stashkit.js`, and serves the playground directory.
2. Visit `http://localhost:3000` (or whichever port `serve` prints). The auto-generated bundle lives alongside the HTML, so module imports succeed without CORS/MIME issues.

The playground loads from `dist/index.js`, so every rebuild reflects your latest changes.

---

## Roadmap Snapshot
- Phase 1 ✅ – core API, TTL, namespacing, TypeScript typings, tests, docs.
- Phase 2 – optional AES-GCM encryption, improved error surfaces.
- Phase 3 – DX niceties (event hooks, cross-tab sync, helper utilities).
- Phase 4 – framework bindings, plugin hooks, IndexedDB fallbacks.

---

## Contributing
See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the full workflow, coding standards, and quality gates. In short:
1. Fork & clone the repo.
2. Install dependencies: `npm install`.
3. Run `npm run lint && npm run test:ci && npm run build` before pushing.
4. Open a PR against `develop`. CI must finish green prior to merge.

Bug reports and feature ideas are welcome via GitHub issues.

---

## Releasing
Maintainers can follow the step-by-step guide in [`RELEASE.md`](RELEASE.md) covering versioning, changelog updates, tagging, and npm publishing. Changesets powers the automated changelog flow—record a release note via `npm run changeset`, run `npm run version-packages`, then follow the release guide or trigger the `Release` GitHub Action (manual workflow) to publish.

---

## License

MIT © StashKit maintainers
