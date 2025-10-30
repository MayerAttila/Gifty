type MemberConnectionBadgeProps = {
  label: string;
  badgeClassName?: string;
};

const MemberConnectionBadge = ({
  label,
  badgeClassName,
}: MemberConnectionBadgeProps) => {
  const baseClasses =
    "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm backdrop-blur-sm";
  const composed = [baseClasses, badgeClassName ?? ""]
    .filter(Boolean)
    .join(" ");

  return <span className={composed}>{label}</span>;
};

export default MemberConnectionBadge;
