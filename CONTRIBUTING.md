# Contributing to StashKit

Thanks for taking the time to contribute! This document explains how we work so your changes can ship smoothly.

## Table of Contents
- [Contributing to StashKit](#contributing-to-stashkit)
  - [Table of Contents](#table-of-contents)
  - [Core Principles](#core-principles)
  - [Project Setup](#project-setup)
  - [Development Workflow](#development-workflow)
  - [Coding Standards](#coding-standards)
  - [Testing \& Quality](#testing--quality)
  - [Commit \& PR Guidelines](#commit--pr-guidelines)
  - [Communication](#communication)

---

## Core Principles
- **Simplicity** – keep the API surface small and intuitive.
- **Predictability** – avoid hidden side-effects; document behavior explicitly.
- **Zero dependencies** – no runtime deps unless absolutely critical.
- **Modern JS/TS** – target evergreen browsers, ES modules, and strict typing.

---

## Project Setup
```bash
git clone https://github.com/<you>/stashkit.git
cd stashkit
npm install
```

Use Node 18+ (CI currently runs Node 18 and 20).

---

## Development Workflow
1. **Create a feature branch** from `develop`.
2. Make focused commits with meaningful messages.
3. Keep the branch up to date with `develop` to reduce merge conflicts.
4. Run the quality gates locally before opening a PR (see below).
5. Generate a Changeset (`npm run changeset`) for any change that impacts users (new features, fixes, breaking changes). If you're unsure, err on the side of adding one.
6. Open a pull request targeting `develop` and fill out the PR template (if present).

---

## Coding Standards
- TypeScript everywhere (`src` for library code, `tests` for Vitest suites).
- Prefer descriptive variable names; keep helper functions small.
- Document non-obvious logic with short comments.
- Avoid `any`; if unavoidable, explain why in a comment.
- Keep public API changes documented in `README.md` and the changelog (see release workflow).

---

## Testing & Quality

| Command | Description |
| --- | --- |
| `npm run lint` | ESLint with type-checking against `src/` and `tests/`. |
| `npm run test` | Fast local Vitest run without coverage. |
| `npm run test:ci` | Coverage-enabled test run (CI uses this). |
| `npm run build` | TypeScript build to ensure declaration + JS output emit cleanly. |

Before opening a PR:
```bash
npm run lint
npm run test:ci
npm run build
```

Add or update tests alongside code changes. Regression or bug fixes must include tests that fail without the change.

---

## Commit & PR Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `docs:`, etc.) when possible; it helps Changesets generate clean changelog entries.
- Keep commits scoped; avoid mixing refactors with feature work.
- PR description should state **what** changed and **why**.
- Reference related issues (`Fixes #123`) to auto-close them on merge.
- Ensure CI passes; otherwise the PR can’t be merged.

---

## Communication
- Use GitHub Issues for bugs, feature requests, or RFCs.
- Draft discussions for larger API changes before implementation.
- Mention maintainers in PRs if you need an expedited review or clarification.

Thanks again for helping make StashKit better!
