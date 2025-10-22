import React, { useMemo } from "react";

interface OccasionDateProps {
  label: string;
  date: Date | string;
  className?: string;
}

const OccasionDate: React.FC<OccasionDateProps> = ({
  label,
  date,
  className = "",
}) => {
  const formattedDate = useMemo(() => {
    const parsed = date instanceof Date ? date : new Date(`${date}T00:00:00`);
    if (!(parsed instanceof Date) || Number.isNaN(parsed.getTime())) {
      return typeof date === "string" ? date : "";
    }
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "2-digit",
    }).format(parsed);
  }, [date]);

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-lg border border-accent-3 bg-primary px-3 py-2 text-sm text-contrast ${className}`}
    >
      <span className="font-medium text-contrast">{label}</span>
      <span className="text-contrast/70">{formattedDate}</span>
    </div>
  );
};

export type { OccasionDateProps };
export default OccasionDate;
