// A coloured message box: errors, successes, or neutral info.
const TONES = {
  error: 'bg-rose-50 text-rose-800 ring-rose-200',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  info: 'bg-indigo-50 text-indigo-900 ring-indigo-200',
};

export default function Alert({ tone = 'info', children, className = '' }) {
  if (!children) return null;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-xl px-4 py-3 text-sm ring-1 ${TONES[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
