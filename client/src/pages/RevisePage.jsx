// Revise tab: the spaced-revision planner is planned for Phase 4, so this is a "coming soon" preview.
import Card from '../components/ui/Card.jsx';
import ComingSoon from '../components/ui/ComingSoon.jsx';
import Icon from '../components/ui/Icon.jsx';

const PREVIEW = [
  { topic: 'Rotational motion', subject: 'Physics', due: 'Day 3 revision' },
  { topic: 'Organic reactions', subject: 'Chemistry', due: 'Day 7 revision' },
  { topic: 'Definite integrals', subject: 'Maths', due: 'Day 21 revision' },
];

export default function RevisePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Revise</h1>
        <ComingSoon />
      </div>

      <Card className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-accent">
          <Icon name="revise" className="h-6 w-6" />
        </div>
        <h2 className="mt-3 text-lg font-bold text-ink">Never forget what you studied</h2>
        <p className="mt-2 text-sm text-muted">
          Mark a topic as done and Study Buddy will remind you to revise it after 1, 3, 7 and 21 days, the spacing that
          helps things stick.
        </p>
      </Card>

      {/* A faded example of what the list will look like. Clearly labelled, nothing here is real data. */}
      <Card aria-label="Example" className="opacity-60">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-ink">Revise today</h2>
          <span className="text-xs text-muted">Example</span>
        </div>
        <ul className="divide-y divide-line">
          {PREVIEW.map((item) => (
            <li key={item.topic} className="flex items-center gap-3 py-3">
              <span className="h-5 w-5 shrink-0 rounded-md ring-2 ring-line" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{item.topic}</p>
                <p className="text-sm text-muted">
                  {item.subject} · {item.due}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
