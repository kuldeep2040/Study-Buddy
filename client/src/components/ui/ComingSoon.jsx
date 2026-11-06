// A small "Coming soon" tag for features that are designed but not built yet.
export default function ComingSoon({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-muted uppercase ${className}`}
    >
      Coming soon
    </span>
  );
}
