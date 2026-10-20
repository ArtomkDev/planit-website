export function AccentRule({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`accent-rule ${className}`} />;
}
