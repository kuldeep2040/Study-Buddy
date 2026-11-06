// "X ended the link" style messages. Shown to the side that DIDN'T end it, until dismissed.
import { dismissNotice } from '../../api/links.js';

const TEXT = {
  student: {
    ended: (name) => `${name} stopped following your progress. They can't see anything anymore.`,
    cancelled: (name) => `${name} cancelled their request to be your supporter.`,
  },
  supporter: {
    declined: (name) => `${name} declined your request.`,
    ended: (name) => `${name} removed you as a supporter. You can't see their progress anymore.`,
  },
};

export default function LinkNotices({ notices, role, onDismissed }) {
  if (!notices?.length) return null;

  async function dismiss(linkId) {
    onDismissed(linkId); // hide it right away; the server call can finish in the background
    dismissNotice(linkId).catch(() => {});
  }

  return (
    <div className="space-y-2">
      {notices.map((notice) => (
        <div key={notice.linkId} role="status" className="flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          <span aria-hidden="true">ℹ️</span>
          <p className="flex-1">{TEXT[role][notice.kind]?.(notice.name) ?? `${notice.name} ended the link.`}</p>
          <button type="button" onClick={() => dismiss(notice.linkId)} className="-my-2 min-h-11 shrink-0 rounded-lg px-2 font-medium hover:bg-amber-100">
            OK
          </button>
        </div>
      ))}
    </div>
  );
}
