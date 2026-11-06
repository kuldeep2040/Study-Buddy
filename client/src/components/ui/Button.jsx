// Our one button style, used everywhere. Variants keep colours consistent across the app.
import Spinner from './Spinner.jsx';

const VARIANTS = {
  primary: 'bg-brand text-white shadow-sm hover:bg-brand-strong focus-visible:outline-brand',
  secondary: 'bg-surface text-ink ring-1 ring-line hover:bg-surface-2 focus-visible:outline-faint',
  danger: 'bg-danger-fill text-white shadow-sm hover:bg-danger-fill-strong focus-visible:outline-danger-fill',
  ghost: 'text-muted hover:bg-surface-2 focus-visible:outline-faint',
};

const SIZES = {
  md: 'min-h-11 px-4 text-sm', // min-h-11 = 44px: comfortable tap target on phones
  lg: 'min-h-14 px-6 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props // anything else (type, onClick…) goes straight to <button>
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition
        focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
