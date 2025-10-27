# Local Flashcards

Minimal, offline-friendly flashcards that run locally. Decks are authored in Markdown, rendered with code blocks, and studied with tap-to-flip + swipe left/right.

- Swipe right = Know (removes from queue)
- Swipe left = Don't know (requeues later)
- Tap = Flip front/back
- Works great for code-heavy decks (GitHub-flavoured Markdown)

## Quick Start

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Importing Decks (Markdown)
You can load decks three ways from the Home screen:
- Download sample Markdown (header link)
- Import Markdown (File)
- Paste Markdown

### Deck Format
Use a title, optional description, then repeat sections for each card.

````markdown
# My Deck

Optional description...

## Front
What is string interpolation?

## Back
```csharp
var message = $"Hello {name}";
```

## Hint
It works with any expression.
````

Notes
- Use GitHub-flavoured Markdown (headings, lists, tables, fenced code blocks).
- Large code blocks scroll within the card.
- Language hints in fences (```csharp, ```js, etc.) are supported for styling.

## Study Controls
- Gesture: drag horizontally to grade, release to commit
- Tap: flip card (front/back)
- On-screen helper: "Tap to flip Drag left/right"

## Data & Privacy
- All data is stored in your browser's localStorage.
- Use "Reset progress" per deck to clear learned state.

## Tech Stack
- Next.js (App Router) + React + TypeScript
- framer-motion (drag/physics), react-markdown (+ remark-gfm/remark-breaks)
- Zustand (state), Tailwind CSS

## Scripts
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`

## Sample Deck
A ready-to-use example lives at `public/sample-deck.md` and is linked from the Home page.


