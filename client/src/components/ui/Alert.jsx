// A coloured message box: errors, successes, or neutral info.
const TONES = {
  error: 'bg-danger-soft text-danger ring-danger-line',
  success: 'bg-success-soft text-success ring-success-line',
  info: 'bg-brand-soft text-ink ring-brand-line',
};

export default function Alert({ tone = 'info', children, className = '' }) {
  if (!children) return null;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-2xl px-4 py-3 text-sm ring-1 ${TONES[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
