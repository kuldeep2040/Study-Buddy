// 🔥 streak chip from the design. Streaks aren't calculated yet (Phase 2), so it says "coming soon".
export default function StreakChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-highlight-soft px-2.5 py-1 text-xs font-semibold text-highlight">
      🔥 Streaks <span className="font-medium opacity-75">· coming soon</span>
    </span>
  );
}
