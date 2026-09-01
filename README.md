# Sinner

**A private vice ledger for your favorite character defects.**

Sinner is a mobile-first bad-habit tracker built around harm reduction, not abstinence. You’re probably going to do the thing anyway. Instead of promising this time is different, tap a button and find out how sinful you’ve actually been lately.

No streaks. No guilt confetti. No wellness sermon. Just you, your weekly limits, and a friend holding the clipboard while you make questionable decisions.

## What V1 does

- Creates custom “Sins” with a definition and weekly limit
- Logs an occurrence in one tap, with a brief chance to undo the evidence
- Tracks today’s count, weekly totals, remaining allowance, pace, and moral condition
- Shows per-Sin event history and a four-week comparison
- Summarizes weekly activity, week-over-week changes, and an eight-week trend
- Lets you edit, archive, or permanently delete a Sin and remove individual events
- Supports Sunday or Monday as the start of the week
- Stores everything in the browser with no account and no cloud
- Exports and imports the full ledger as JSON
- Includes a web app manifest and service worker for home-screen installation and basic offline caching

## Stack

- React
- TypeScript
- Vite
- Vitest
- Browser `localStorage` for persistence
- Plain CSS, because the sins are complicated enough

## Run it locally

You’ll need Node.js and npm. Then:

```bash
git clone https://github.com/who-is-michael-mercer/Sinner.git
cd Sinner
npm install
npm run dev
```

Open the local URL Vite prints in the terminal. No environment variables are required; your evidence stays in that browser unless you export it.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Type-checks the project and creates a production build |
| `npm run typecheck` | Runs the TypeScript project build checks |
| `npm run preview` | Serves the production build locally |
| `npm test` | Runs the Vitest test suite once |

## Project structure

```text
src/
  App.tsx          UI, navigation, and interactions
  data.ts          local storage, import/export, and record creation
  status.ts        weekly calculations and moral sentencing
  status.test.ts   tests for status thresholds and week boundaries
  styles.css       the whole suspiciously polished outfit
public/
  manifest.webmanifest
  sw.js            installability and basic caching
```

## Status

This is an early V1 and primarily a personal project, occasionally fit for distribution among friends with similarly imperfect judgment. The data model is local-only, the rough edges are real, and nobody is pretending this is your therapist.

Go forth. Make choices. Keep receipts.
