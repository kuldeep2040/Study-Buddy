// Plain-language list of exactly what linked supporters can and can't see. (Transparency principle.)
// ⚠️ If a future feature shares something new, it MUST be added here.

const CAN = [
  'When you are studying: the subject and how long it has been running',
  'When you pause or resume, and your Pomodoro rounds and breaks',
  "Today's total study time, your daily goal and how close you are to it",
  'This week: hours per day and per subject',
  'Your full study history (days, totals, subjects and sessions), including days before they linked',
  'A Telegram message when you start, pause, resume or stop studying, and at each Pomodoro break, if they connected Telegram',
];

const CANNOT = [
  'Change anything: they have read-only access',
  'See your email, password or settings',
  'See anything after they stop following you',
];

export default function SharingInfo() {
  return (
    <div>
      <ul className="space-y-2 text-sm text-ink-soft">
        {CAN.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true">✅</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <h3 className="mt-4 text-sm font-semibold text-ink">They can&apos;t:</h3>
      <ul className="mt-2 space-y-2 text-sm text-ink-soft">
        {CANNOT.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true">🚫</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
