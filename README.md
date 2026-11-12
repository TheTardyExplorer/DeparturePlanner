# Departure Planner

A small, offline-first web app for answering one question: **when do I need to start
getting ready?**

Set the time you need to arrive, add the things you do before leaving, and Departure
Planner works backwards through the timeline. It is a static site with no backend — all
plans, presets, settings, and task defaults live in the browser.

## Features

- Reverse timeline from any arrival time, including plans that cross midnight
- Arrival day toggle (today / tomorrow) with a warning when the time has already passed
- Per-plan duration overrides without touching your saved defaults
- Reusable task library with custom emoji, names, and default timings
- Named plan presets (optionally remembering the arrival time)
- Drag-to-reorder steps with accessible keyboard support
- 12/24-hour display, light/dark/system themes
- JSON export/import for backups
- Installable PWA with offline support and iOS home-screen metadata

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 with shadcn/ui-style components on Radix primitives
- Zustand (persisted to `localStorage`)
- `@dnd-kit` for reordering, Sonner for toasts, Lucide for icons
- `vite-plugin-pwa` for the manifest and service worker
- Vitest for time-calculation tests

## Getting started

Requires Node 22+ and pnpm.

```bash
pnpm install
pnpm dev       # http://localhost:5173
pnpm test      # unit tests
pnpm build     # typecheck + production build
pnpm preview   # preview the production build
```

## Deployment

The repo includes `.github/workflows/deploy.yml`, which tests, builds, and publishes to
GitHub Pages on every push to `main`.

1. Push the repository to GitHub.
2. Open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually).

Vite uses a relative `base` (`./`), so the build works at any Pages path — project sites
(`/DeparturePlanner/`), user sites, or a custom domain — without configuration changes.

## Data & privacy

Everything is stored locally under the `departure-planner` localStorage key. There are no
accounts, analytics, or API calls. The app is precached by a service worker after the first
visit, so it keeps working offline.

Because browser storage can be cleared (for example by clearing Safari data), use
**Settings → Export** to keep a JSON backup. Import restores it.

## Installing on iPhone

Open the site in Safari, tap **Share → Add to Home Screen**. The manifest and Apple meta
tags give it a standalone, full-screen window with safe-area padding and a system-themed
status bar.

## Project structure

```
src/
  components/        Planner UI, sheets, timeline, shared form fields
  components/ui/     Small shadcn-style primitives (button, input, sheet, segmented)
  lib/
    defaults.ts      Built-in task library and emoji choices
    time.ts          Reverse timeline math and formatting (unit tested)
    store.ts         Zustand store + localStorage persistence
    hooks.ts         Theme application and live clock
public/              App icons and favicon
scripts/             Icon generator (requires Pillow)
.github/workflows/   GitHub Pages deployment
```

Regenerate the PNG icons after changing the mark with `pnpm icons` (requires Python and
Pillow).
