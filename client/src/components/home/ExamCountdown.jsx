// "📅 JEE Main in 30 days" chip under the greeting.
import { Link } from 'react-router-dom';
import { daysUntil } from '../../utils/format.js';

const CHIP = 'inline-block rounded-full bg-brand-soft px-2.5 py-1 text-xs text-ink';

export default function ExamCountdown({ examName, examDate }) {
  if (!examDate) return null;
  const days = daysUntil(examDate);

  if (days < 0) {
    return (
      <Link to="/settings" className={`${CHIP} font-semibold`}>
        📅 Exam date passed · set the next one
      </Link>
    );
  }

  let text;
  if (days > 1) text = <>📅 <strong>{examName}</strong> in <strong className="tabular-nums">{days}</strong> days</>;
  else if (days === 1) text = <>📅 <strong>{examName}</strong> is <strong>tomorrow</strong>. You&apos;ve got this!</>;
  else text = <>🍀 <strong>{examName}</strong> is <strong>today</strong>. Good luck!</>;

  return <p className={CHIP}>{text}</p>;
}
