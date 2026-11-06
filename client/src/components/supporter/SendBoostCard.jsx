// "Send a boost" from the design: quick encouraging messages to the student. Not built yet,
// so the chips and button are shown disabled with "coming soon".
import Card from '../ui/Card.jsx';
import ComingSoon from '../ui/ComingSoon.jsx';

const BOOSTS = ['Keep going', 'Proud of you', 'Time for a break?'];

export default function SendBoostCard({ studentName }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-ink">Send a boost</h2>
        <ComingSoon />
      </div>
      <p className="mt-1 text-sm text-muted">Send {studentName} a quick note of encouragement.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {BOOSTS.map((text) => (
          <span key={text} className="rounded-full px-3.5 py-2 text-sm font-semibold text-muted ring-1 ring-line">
            {text}
          </span>
        ))}
      </div>
      <button type="button" disabled className="mt-3 min-h-11 w-full cursor-not-allowed rounded-2xl bg-brand text-sm font-semibold text-white opacity-50">
        Send to {studentName}
      </button>
    </Card>
  );
}
