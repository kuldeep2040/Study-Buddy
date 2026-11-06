// A card with a header you tap to open/close (down-arrow turns up when open).
// `summary` = a short line shown under the title, e.g. "JEE Main · 6h a day", so you can see the
// value without opening it. The content stays mounted while closed (just hidden), so a half-typed
// form isn't lost when you collapse it.
import { useId, useState } from 'react';
import Icon from './Icon.jsx';

export default function CollapsibleCard({ title, summary, defaultOpen = false, className = '', children, ...props }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className={`rounded-3xl bg-surface shadow-sm shadow-black/[0.04] ${className}`} {...props}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-14 w-full items-center gap-3 rounded-3xl px-4 py-3 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-ink">{title}</span>
          {summary && <span className="block truncate text-sm text-muted">{summary}</span>}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted">
          <Icon name="chevron" className={`h-5 w-5 transition-transform ${open ? '-rotate-90' : 'rotate-90'}`} />
        </span>
      </button>
      <div id={contentId} hidden={!open} className="px-4 pb-4">
        {children}
      </div>
    </section>
  );
}
