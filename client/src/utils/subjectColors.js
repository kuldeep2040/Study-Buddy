// Each subject gets a colour dot, defined in index.css as --sb-subject-1..8 (adapts to dark mode).
// The colour depends ONLY on the subject's name, so it's the same on every screen, for the student
// and the supporter. Common subjects get the design's colours; others get a stable colour from their name.
const COLOR_COUNT = 8;
const PRESET = { physics: 1, maths: 2, math: 2, mathematics: 2, chemistry: 3, biology: 4, english: 5, history: 6, economics: 7, geography: 8 };

/** → a CSS colour like 'var(--sb-subject-2)'. */
export function subjectColor(name) {
  const key = name.trim().toLowerCase();
  let slot = PRESET[key];
  if (!slot) {
    let hash = 0;
    for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) % 997;
    slot = (hash % COLOR_COUNT) + 1;
  }
  return `var(--sb-subject-${slot})`;
}
