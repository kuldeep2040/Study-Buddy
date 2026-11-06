// One-time link messages ("X is now your supporter", "X stopped following"), shown until dismissed.
import { dismissNotice } from '../../api/links.js';

const TEXT = {
  student: {
    joined: (name) => `${name} is now your supporter. They can see your study progress (see "What your supporters can see" in Settings).`,
    ended: (name) => `${name} stopped following your progress. They can't see anything anymore.`,
    cancelled: (name) => `${name} cancelled their request to be your supporter.`, // legacy
  },
  supporter: {
    // Legacy: students can no longer decline or remove, but old messages may still exist.
    declined: (name) => `${name} declined your request.`,
    ended: (name) => `${name} removed you as a supporter. You can't see their progress anymore.`,
  },
};

const STYLE = {
  joined: { icon: '🎉', box: 'bg-success-soft text-success ring-success-line', button: 'hover:bg-success-soft' },
  other: { icon: 'ℹ️', box: 'bg-warn-soft text-warn-ink ring-warn-line', button: 'hover:bg-warn-soft' },
};

export default function LinkNotices({ notices, role, onDismissed }) {
  if (!notices?.length) return null;

  async function dismiss(linkId) {
    onDismissed(linkId); // hide it right away; the server call can finish in the background
    dismissNotice(linkId).catch(() => {});
  }

  return (
    <div className="space-y-2">
      {notices.map((notice) => {
        const style = STYLE[notice.kind] ?? STYLE.other;
        return (
          <div key={notice.linkId} role="status" className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ring-1 ${style.box}`}>
            <span aria-hidden="true">{style.icon}</span>
            <p className="flex-1">{TEXT[role][notice.kind]?.(notice.name) ?? `${notice.name} ended the link.`}</p>
            <button type="button" onClick={() => dismiss(notice.linkId)} className={`-my-2 min-h-11 shrink-0 rounded-lg px-2 font-medium ${style.button}`}>
              OK
            </button>
          </div>
        );
      })}
    </div>
  );
}
