## Summary
Improve how flashcards render Markdown code while documenting the formatting requirements and providing a richer sample deck.

## Changes
- Add a dedicated `CodeBlock` component with highlight.js syntax highlighting, copy + wrap controls, and dark/light aware styling.
- Wire the new renderer into the flashcard Markdown pipeline and refactor motion styles to avoid `any` casts.
- Extend global styles with shared mono font + token colour variables so highlighted spans render consistently.
- Update the project plan with explicit code-block acceptance criteria and expand the bundled sample deck with an extra JavaScript card.

## Files of Note
- `src/components/CodeBlock.tsx`: Reusable renderer handling highlighting, copy action, and wrap toggling.
- `src/components/Flashcard.tsx`: Uses the new component and cleans up motion style typing.
- `src/app/globals.css`: Colour tokens applied to highlight.js classes.
- `public/sample-deck.md`: Adds an additional code-heavy flashcard for quick QA.
- `local-flashcards-plan.md`: Captures the formatting requirements the team aligned on.

## Implementation Details
- highlight.js `lib/common` keeps bundle size down while covering popular languages; aliases map shorthand fences (```cs) to the expected lexer.
- Copy feedback is stored in component state and resets via a timeout effect so it remains accessible for screen readers.
- Motion styles are defined ahead of time and typed as `MotionStyle`, removing the need for `as any` casts.
- All new UI controls are keyboard reachable and respect the existing theme tokens.

## Testing
- `npm run lint` *(fails: existing hook dependency violations in `src/app/study/[setId]/page.tsx` and the pre-existing `setState` reset effect in `Flashcard.tsx`; no new issues introduced)*
- Manually imported `public/sample-deck.md` and verified fenced blocks show language labels, copy/wrap controls, and highlight tokens in both themes.

## Deployment/Notes
- Run `npm install` to pull `highlight.js`.
- Lint still reports legacy warnings; follow-up PR will address hook dependency tidy-ups.