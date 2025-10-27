import type { ImportSetJson } from "./types";

// Parse a Markdown deck into ImportSetJson.
// Format:
// # Title (optional)
// <description paragraphs>
// ## Front
// ...markdown for front...
// ## Back
// ...markdown for back...
// ## Hint (optional)
// ...markdown for hint...
// --- (optional separator; ignored)
// Repeat Front/Back/Hint sections for each card.
// Headings can be level 2 or 3. Content can include fenced code blocks.

export function parseMarkdownDeck(md: string): ImportSetJson {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  let title = "Imported Deck";
  let description = "";

  // Track whether inside fenced code block to ignore headings there
  let inFence = false;
  const fenceRegex = /^\s*```/;

  // Identify title
  let i = 0;
  if (lines[0] && /^#\s+/.test(lines[0])) {
    title = lines[0].replace(/^#\s+/, "").trim();
    i = 1;
  }

  type Section = { kind: "front" | "back" | "hint"; start: number; end: number };
  const sections: Array<Section> = [];

  // First pass: find section headings
  const isSectionHeading = (line: string) => /^(##|###)\s+(Front|Back|Hint)\s*$/i.test(line.trim());
  const sectionName = (line: string): Section["kind"] => {
    const m = line.trim().match(/^(##|###)\s+(Front|Back|Hint)\s*$/i)!;
    const name = m[2].toLowerCase();
    return name as Section["kind"];
  };

  const headingIndexes: Array<{ idx: number; kind: Section["kind"] }> = [];

  for (let idx = i; idx < lines.length; idx++) {
    const line = lines[idx];
    if (fenceRegex.test(line)) inFence = !inFence;
    if (!inFence && isSectionHeading(line)) {
      headingIndexes.push({ idx, kind: sectionName(line) });
    }
  }

  // Description: text between after title and first section
  if (headingIndexes.length > 0) {
    const first = headingIndexes[0].idx;
    const desc = lines.slice(i, first).join("\n").trim();
    if (desc) description = desc;
  } else {
    // No sections; whole file is description; no cards
    const desc = lines.slice(i).join("\n").trim();
    if (desc) description = desc;
  }

  // Build sections with start/end
  for (let j = 0; j < headingIndexes.length; j++) {
    const cur = headingIndexes[j];
    const nextIdx = j + 1 < headingIndexes.length ? headingIndexes[j + 1].idx : lines.length;
    sections.push({ kind: cur.kind, start: cur.idx + 1, end: nextIdx });
  }

  // Create cards by pairing Front -> Back [-> Hint]
  const cards: Array<{ front: string; back: string; hint?: string }> = [];
  for (let j = 0; j < sections.length; j++) {
    const s = sections[j];
    if (s.kind !== "front") continue;
    const front = lines.slice(s.start, s.end).join("\n").trim();

    // Find Back between this Front and next Front
    let back = "";
    let hint: string | undefined;
    let k = j + 1;
    for (; k < sections.length; k++) {
      if (sections[k].kind === "front") break;
      if (!back && sections[k].kind === "back") {
        back = lines.slice(sections[k].start, sections[k].end).join("\n").trim();
      } else if (sections[k].kind === "hint") {
        hint = lines.slice(sections[k].start, sections[k].end).join("\n").trim();
      }
    }
    if (front && back) {
      cards.push({ front, back, hint });
    }
  }

  return { title, description: description || undefined, cards };
}

export function isLikelyJsonDeck(text: string): boolean {
  const t = text.trim();
  return t.startsWith("{") || t.startsWith("[");
}
