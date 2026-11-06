// "📅 JEE Main in 30 days" under the greeting.
import { Link } from 'react-router-dom';
import { daysUntil } from '../../utils/format.js';

export default function ExamCountdown({ examName, examDate }) {
  if (!examDate) return null;
  const days = daysUntil(examDate);

  let text;
  if (days > 1) text = <>📅 <strong>{examName}</strong> in <strong className="tabular-nums">{days}</strong> days</>;
  else if (days === 1) text = <>📅 <strong>{examName}</strong> is <strong>tomorrow</strong>. You&apos;ve got this! 💪</>;
  else if (days === 0) text = <>🍀 <strong>{examName}</strong> is <strong>today</strong>. Good luck!</>;
  else
    return (
      <p className="text-sm text-slate-600">
        Your exam date has passed.{' '}
        <Link to="/settings" className="font-semibold text-indigo-600 underline">
          Set the next one
        </Link>
      </p>
    );

  return <p className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-900 ring-1 ring-indigo-200">{text}</p>;
}
