# Local Flashcards — Development Plan (Next.js + React)
**Version:** 1.0 · **Owner:** [Your Name] · **Last Updated:** [YYYY-MM-DD]

## 0) Summary
- Goal: A personal, offline-friendly flashcard app you run locally.
- Must-haves:
  1) Home screen = iPhone-style grid of sets.
  2) Import sets from Markdown.
  3) Study flow with swipe left = don’t know (requeue), swipe right = know (remove).
  4) Progress bar shows % learned.
- Out of scope: Auth, users, cloud DB, share links.

---

## 1) Requirements

### 1.1 Functional
- F1. Home (Sets grid): List all sets stored locally; tap to open; buttons: Import Markdown, New (manual), Delete, Reset progress.
- F2. Import: Upload Markdown (see schema below). Validate; save to local storage; show toast on success.
- F3. Study:
  - Load selected set’s active queue.
  - Right swipe / Right Arrow = Know → remove from current queue.
  - Left swipe / Left Arrow = Don’t know → reinsert a few positions later.
  - Repeat until queue empty; then show “All learned” summary.
- F4. Progress bar: (learnedCount / totalCards) * 100 updates after each grade.
- F5. Persistence: Sets and per-set learned state persist in localStorage.
- F6. Keyboard fallback: Left/Right arrow keys mirror swipes; buttons for accessibility.

### 1.2 Non-Functional
- Offline-first: Everything runs without network.
- Perf: Instant navigation; 60fps card drag/swipe animations.
- A11y: Keyboard-operable; visible focus; sufficient contrast.

### 1.3 Acceptance Criteria (AC)
```
Given a valid Markdown deck is imported
When I open that set and study
Then right-swipe removes a card from queue
And left-swipe keeps it in the queue (reappears later)
And the progress bar increases only on right-swipes
And the session ends when all cards are learned
```

---

## 2) UX & UI

### 2.1 Screens
- Home: iPhone-like grid of rounded tiles (deck name, count). Top bar: “Import”, “New”, “Settings (optional)”.
- Study: Full-bleed card with front face; tap/flip for back.
  - Drag horizontally with Framer Motion; thresholds decide Know/Don’t know.
  - Top: Progress bar + “X/Y learned”.
  - Bottom: Left/Right buttons (with arrow key hints) for a11y.

### 2.2 Gestures & Thresholds
- Drag x with spring; if x < -120 → Don’t know; if x > 120 → Know; else snap back.

---

## 3) Data & Import

### 3.1 Markdown Format
`markdown\n\#\ Spanish\ A1\ -\ Basics\n\nGreetings\ &\ essentials\n\n\#\#\ Front\nHola\n\n\#\#\ Back\nHello\n\n---\n\n\#\#\ Front\nGracias\n\n\#\#\ Back\nThank\ you\n``n
- id and card id are optional; generated if missing.
- Validation: title required; cards ≥ 1; each card has front and back.

### 3.2 Local Storage Layout
```ts
localStorage["fc:sets"] = JSON.stringify({
  byId: {
    "bio-101": { id, title, description, cards: [ {id, front, back, hint} ] }
  },
  allIds: ["bio-101", "spanish-a1"]
});

localStorage["fc:state"] = JSON.stringify({
  "bio-101": {
    learned: { "c1": true, "c2": false },
    updatedAt: "2025-10-26T00:00:00Z"
  }
});
```

---

## 4) Study Queue Algorithm

### 4.1 Behavior
- Start with queue = allCards.filter(!learned).
- Know: remove current card from queue; mark learned.
- Don’t know: reinsert current card at index + REQUEUE_OFFSET (e.g., +3, or end if short).
- Session ends when queue.length === 0.

### 4.2 Pseudocode
```ts
const REQUEUE_OFFSET = 3;

function startQueue(cards, learnedMap) {
  return cards.filter(c => !learnedMap[c.id]);
}

function grade(queue, currentIndex, grade) {
  const [current] = queue.splice(currentIndex, 1);
  if (grade === "dont") {
    const pos = Math.min(REQUEUE_OFFSET, queue.length);
    queue.splice(pos, 0, current);
  } else {
    // mark learned externally
  }
  return queue;
}
```

---

## 5) Architecture & Stack

- Framework: Next.js (App Router) + React 18 + TypeScript.
- State: Local component state + lightweight Zustand or React Context for sets & study state.
- Persistence: localStorage wrapper (with safe JSON parse/stringify).
- Animations: Framer Motion for draggable cards.
- Styling: Tailwind CSS; system fonts.
- No API / No serverless: all client-side.

---

## 6) Repository Layout

```
local-flashcards/
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                      # Home (sets grid)
│  │  ├─ study/[setId]/page.tsx        # Study view
│  │  └─ layout.tsx
│  ├─ components/
│  │  ├─ SetTile.tsx                   # iPhone-like tile
│  │  ├─ ImportDialog.tsx              # Import UI
│  │  ├─ ProgressBar.tsx
│  │  ├─ Flashcard.tsx                 # draggable, flip
│  │  └─ StudyControls.tsx             # left/right buttons & key handlers
│  ├─ lib/
│  │  ├─ storage.ts                    # get/set/clear LS helpers
│  │  ├─ sets.ts                       # CRUD for sets in LS
│  │  ├─ studyState.ts                 # learned flags per set
│  │  ├─ queue.ts                      # queue logic
│  │  └─ types.ts                      # TypeScript types
│  └─ styles/globals.css
├─ public/sample-deck.md
├─ package.json
├─ tsconfig.json
└─ README.md
```

---

## 7) Types (sketch)
```ts
export type Card = { id: string; front: string; back: string; hint?: string };
export type SetDoc = { id: string; title: string; description?: string; cards: Card[] };

export type SetsState = { byId: Record<string, SetDoc>; allIds: string[] };
export type StudyState = { [setId: string]: { learned: Record<string, boolean>; updatedAt: string } };
```

---

## 8) Key Interactions (UI Logic)

- Import Markdown  
  - File input → parse → validate → write to fc:sets → toast → grid updates.
- Open Set  
  - Build queue from !learned. If empty → prompt “Reset progress?”.
- Swipe / Buttons / Keys  
  - Flip with tap/space.  
  - Left (Left Arrow) → grade(..., "dont").  
  - Right (Right Arrow) → grade(..., "know") + mark learned + update progress.  
- Progress  
  - learnedCount = Object.values(learned).filter(Boolean).length.  
  - percent = Math.floor(learnedCount / total * 100).

---

## 9) Testing

- Unit (Vitest): queue.ts (know/don’t know), storage read/write, deck validation.
- E2E (Playwright):  
  1) Import sample → open set → right/right/right → finish session.  
  2) Import sample → left once → card reappears before finish.  
  3) Reset progress → percent returns to 0%.
- A11y: Keyboard-only pass; no swipe required.

---

## 10) Build & Run

```bash
# create
npx create-next-app@latest local-flashcards --ts --eslint --tailwind --app
cd local-flashcards
npm i framer-motion zustand
# dev
npm run dev
# open
http://localhost:3000
```

---

## 11) Nice-to-Haves (later)
- Export Markdown, search on Home, tag chips on tiles, PWA install for offline homescreen, dark mode toggle, card images (drag-n-drop), CSV import.

---

## 12) Mini Roadmap (2–3 days)
- Day 1: Types, storage, sets CRUD, Home grid, Import.  
- Day 2: Study page with draggable card, progress bar, keyboard controls.  
- Day 3: Polish (flip animation, toasts, delete/reset), tests, sample deck.

---

## 13) Code Block Formatting Requirements
- Preserve author indentation while optionally allowing soft-wrap toggling per block.
- Show the detected language label when available; default to "Code" otherwise.
- Provide a one-tap copy-to-clipboard action with visible success feedback.
- Keep blocks within card bounds via max-height + smooth horizontal scrolling.
- Align colors and contrast with light and dark themes, including controls.
- Maintain inline code styling distinct yet unobtrusive within body copy.

---
### Sample public/sample-deck.md
`markdown\n\#\ Spanish\ A1\ -\ Basics\n\nGreetings\ &\ essentials\n\n\#\#\ Front\nHola\n\n\#\#\ Back\nHello\n\n---\n\n\#\#\ Front\nGracias\n\n\#\#\ Back\nThank\ you\n``n








