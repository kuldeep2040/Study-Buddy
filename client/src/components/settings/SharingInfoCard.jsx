// Plain-language list of exactly what linked supporters can and can't see. (Transparency principle.)
// ⚠️ If a future feature shares something new, it MUST be added here.
import Card from '../ui/Card.jsx';

const CAN = [
  'When you are studying: the subject and how long it has been running',
  "Today's total study time",
  'Your full study history (days, totals, subjects and sessions), including days before they linked',
  'A Telegram message when you start and stop studying, if they connected Telegram',
];

const CANNOT = [
  'Change anything: they have read-only access',
  'See your email, password or settings',
  'See anything before you accept their request, or after you remove them',
];

export default function SharingInfoCard() {
  return (
    <Card>
      <h2 className="font-semibold text-slate-900">What your supporters can see</h2>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {CAN.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true">✅</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">They can&apos;t:</h3>
      <ul className="mt-2 space-y-2 text-sm text-slate-700">
        {CANNOT.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true">🚫</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
