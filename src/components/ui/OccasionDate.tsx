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
    const parsed =
      date instanceof Date ? date : new Date(`${date}T00:00:00`);
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
      className={`flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}
    >
      <span className="font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <span className="text-slate-600 dark:text-slate-300">
        {formattedDate}
      </span>
    </div>
  );
};

export type { OccasionDateProps };
export default OccasionDate;
