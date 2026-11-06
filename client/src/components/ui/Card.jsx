// A rounded panel on the warm background — the basic building block of every screen.
// `pad` sets the inner spacing (a separate prop, because two padding classes in one string clash).
export default function Card({ as: Tag = 'section', pad = 'p-4', className = '', children, ...props }) {
  return (
    <Tag className={`rounded-3xl bg-surface shadow-sm shadow-black/[0.04] ${pad} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
