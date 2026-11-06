// A white rounded panel — the basic building block of every screen.
export default function Card({ as: Tag = 'section', className = '', children, ...props }) {
  return (
    <Tag className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 ${className}`} {...props}>
      {children}
    </Tag>
  );
}
