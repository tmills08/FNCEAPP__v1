# Index Flashcards

A Quizlet-style app for learning the companies in major stock indices, starting with the FTSE 100.
React + TypeScript + Vite. Progress is stored in the browser (no accounts yet).

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests (Vitest), including validation of the data files
npm run build    # typecheck + production build
```

## Editing company data

All company data lives in **`src/data/indices/ftse100.json`**. Each company looks like:

```json
{
  "id": "diageo",
  "name": "Diageo",
  "ticker": "DGE",
  "sector": "Consumer Staples",
  "industry": "Beverages",
  "headquarters": { "city": "London", "country": "United Kingdom" },
  "description": "The world's largest spirits company by sales, also brewing Guinness.",
  "brands": ["Johnnie Walker", "Guinness", "Smirnoff", "Baileys"],
  "competitors": ["Pernod Ricard", "Brown-Forman", "Bacardi"]
}
```

- `id`: a lowercase slug, unique within the index. Learners' progress is keyed on it, so **don't rename an id**
  once people have studied it. Changing any other field is safe.
- `sector`: must be one of the 11 ICB industries (`SECTORS` in `src/types/models.ts`).
- `industry`: optional finer label.
- `brands` and `competitors`: must each contain at least one entry.

The data is validated when the app starts and by `npm test`, so a typo such as a misspelt sector
or a duplicate ticker fails with a message naming the company.

> **Data status:** the file currently holds a curated set of **49** well-known constituents, not all 100.
> FTSE 100 membership changes every quarter, and some facts (HQs, brands, recent deals) should be checked
> against company reports before you rely on them for teaching. Update `lastReviewed` when you do.

### Adding another index

1. Create `src/data/indices/sp500.json` in the same shape (`id`, `name`, `country`, `exchange`, `lastReviewed`, `companies`).
2. Import it and add it to the `INDICES` list in `src/data/indices/index.ts`.

It then appears in the index picker. Sectors use ICB names. For the S&P 500 you'd either map GICS sectors
onto these or widen `SECTORS`.

## Data model

| Type | Where | Notes |
| --- | --- | --- |
| `StockIndex` | JSON | Index metadata plus `companies[]` |
| `Company` | JSON | name, ticker, sector, HQ, description, brands, competitors |
| `Card` | generated | One per company per `CardKind`, id `ftse100:diageo:profile` |
| `ReviewState` | localStorage | SM-2 state per card id: ease, interval, repetitions, dueAt, lapses |

Card kinds (`src/lib/deck.ts`):

- **profile**: front shows the company name and ticker; back shows everything.
- **brands**: front shows the company's brands, with the company's own name masked
  (e.g. "■■■card" for Barclaycard), plus its sector as a hint; back shows the company.

Adding a kind means adding it to `CardKind`/`CARD_KINDS` and giving it a front face in `Flashcard.tsx`.

## Spaced repetition

`src/lib/sm2.ts` implements SM-2. The buttons map to grades: Again = 1, Hard = 3, Good = 4, Easy = 5.

- Successful reviews schedule 1 day, then 6 days, then `previous interval × ease`.
- "Again" resets the card and puts it back in the current session's queue.
- Ease starts at 2.5, changes with every grade, and never drops below 1.3.

A session contains every due card (most overdue first) plus up to N new cards, where N is set on the
home screen. A session never includes two cards for the same company, so a company's brands card
can't appear straight after its profile card.

## Project structure

```
src/
  types/models.ts          domain types (Company, StockIndex, Card, ReviewState, SECTORS)
  data/indices/            one JSON file per index + registry (index.ts)
  lib/
    validateIndex.ts       runtime validation of index JSON
    sm2.ts                 SM-2 scheduling
    deck.ts                card generation, session building, stats
    maskName.ts            hides the company name in brand clues
    storage.ts             localStorage persistence (swap here for mobile/backend)
  hooks/useProgress.ts     React state + persistence for review progress
  components/
    Home.tsx               index picker, stats, start session
    StudySession.tsx       session queue, grading, keyboard shortcuts
    Flashcard.tsx          card faces + CompanyDetails
```

## Roadmap

- **Quiz mode** (next): multiple-choice questions generated from the same data, e.g. "Which company owns
  Guinness?" or "Which sector is Sage in?", with distractors drawn from other companies (same sector where
  possible). It will live in `src/lib/quiz.ts` + `components/Quiz.tsx` and reuse `storage.ts`.
- Complete the FTSE 100 list, then add the S&P 500.
- Mobile: the UI is already responsive. Wrapping it with Capacitor would mainly mean swapping
  `storage.ts` for Capacitor Preferences.
