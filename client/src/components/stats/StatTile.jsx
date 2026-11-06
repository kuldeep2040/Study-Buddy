// A small number tile ("Daily average 5h 04m"). `soon` = the feature isn't built yet.
import ComingSoon from '../ui/ComingSoon.jsx';

export default function StatTile({ label, value, unit, highlight = false, soon = false }) {
  return (
    <div className="rounded-3xl bg-surface p-4 shadow-sm shadow-black/[0.04]">
      <p className="text-sm text-muted">{label}</p>
      {soon ? (
        <ComingSoon className="mt-3" />
      ) : (
        <p className="mt-1">
          <span className={`text-2xl font-bold tracking-tight tabular-nums ${highlight ? 'text-highlight' : 'text-ink'}`}>{value}</span>
          {unit && <span className="ml-1 text-sm font-semibold text-muted">{unit}</span>}
        </p>
      )}
    </div>
  );
}
