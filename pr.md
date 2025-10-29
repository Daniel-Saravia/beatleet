## Summary
Add inline Markdown guidance and richer import options so users can learn the deck format and paste new sets without leaving the app.

## Changes
- Replace the header download link with an `MD Format Guide` modal that outlines the required Markdown structure with a sample deck.
- Extend the import dialog with a dedicated "Paste Markdown" flow, including validation and reuse of the existing parser for Markdown/JSON text.
- Harden Markdown rendering by flagging code-block wrappers so React avoids nesting `<div>` elements inside paragraphs, eliminating hydration warnings for fenced blocks.

## Implementation Details
- Centralised parsing in `ImportDialog` via `parseDeckText`, sharing logic across file uploads and pasted content while surfacing user-friendly errors.
- The guide and paste modals share accessibility affordances (focusable controls, close buttons) and respect light/dark theming.
- `CodeBlock` now sets `data-code-block="true"`; the Markdown paragraph renderer inspects this marker to decide whether to wrap content in a `<p>` tag.

## Testing
- `npm run lint` *(fails: pre-existing hook dependency warnings in `src/app/study/[setId]/page.tsx`; no new issues introduced).* 
- Manually verified: opening the MD Format Guide, importing decks via file and via pasted Markdown/JSON, and viewing fenced code blocks without hydration errors.

## Deployment/Notes
- No new dependencies.
- Follow-up: clean up the legacy lint errors in the study page when time allows.