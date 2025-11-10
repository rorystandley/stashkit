# Release Guide

This document walks maintainers through cutting a new StashKit release. All commands assume you run them from the repository root. You can either follow the manual steps below or trigger the `Release` GitHub Actions workflow (which automates the same process) using npm Trusted Publishing—no long-lived npm tokens required.

## 0. Enable Trusted Publishing (one-time)
1. On npmjs.com, open the `stashkit` package → **Settings** → **Publish from CI**.
2. Enable **Trusted Publishing** and link this GitHub repository.
3. When the workflow runs for the first time, approve the pending request on npm.

After that, `npm publish --provenance` (invoked by our release workflow) can authenticate via GitHub’s OIDC identity automatically.

## 1. Prerequisites
- You have publish access to the `stashkit` package on npm.
- You are on the `develop` branch with a clean working tree.
- Node 18+ and npm ≥ 9 are installed.

## 2. Triage & Planning
1. Review open issues/PRs to ensure the milestone scope is complete.
2. Confirm CI is green on `develop`.
3. Decide the semantic version bump (major/minor/patch) based on changes.

## 3. Update Project Metadata
1. Ensure every user-facing change has an accompanying Changeset (`npm run changeset`). Each Changeset automatically updates the changelog and decides the semver bump.
2. Run `npm run version-packages` to apply pending Changesets. This updates package versions and the changelog.
3. Update `README.md` or other docs if the public API changed.

## 4. Quality Gates
Run the full suite locally:
```bash
npm run lint
npm run test:ci
npm run build
```
Fix any failures before moving on.

## 5. Tag & Publish
```bash
git push origin develop
git checkout main
git merge --no-ff develop
git push origin main
NPM_CONFIG_PROVENANCE=true NPM_CONFIG_ACCESS=public npm run release
git push origin --tags
```

`npm run release` runs `changeset publish`, which internally calls `npm publish --provenance` (Trusted Publishing) and generates tags based on the Changesets version metadata.

## 6. Post-Release
- Open a PR (or merge) from `main` back into `develop` if needed to keep version history aligned.
- Announce the release (GitHub Releases, blog, social) summarizing key features and upgrades.
- Close the milestone and update any project tracking docs.

## 7. Automation Wishlist
Future improvements (optional but encouraged):
- Add snapshot releases or nightly builds.
- Add an `npm publish --dry-run` job when versioning to validate packages before tagging.

Following this checklist ensures every release is consistent, traceable, and well-documented. Happy shipping!
