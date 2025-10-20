import React, { useState } from "react";
import type { FormState } from "../AddMemberTypes";
import { formatDateForDisplay } from "../../../utils/date";

interface SpecialDatesStepProps {
  formState: FormState;

  onAddDate: (entry: { label: string; date: string }) => void;
  onRemoveDate: (index: number) => void;
}

const SpecialDatesStep: React.FC<SpecialDatesStepProps> = ({
  formState,
  onAddDate,
  onRemoveDate,
}) => {
  const [label, setLabel] = useState("");
  const [date, setDate] = useState("");

  const canAdd = label.trim().length > 0 && Boolean(date);
  const handleAdd = () => {
    if (!canAdd) return;
    onAddDate({ label: label.trim(), date });
    setLabel("");
    setDate("");
  };

  const combinedDates = [
    ...(formState.birthday
      ? [{ label: "Birthday", date: formState.birthday }]
      : []),
    ...formState.specialDates,
  ];

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Occasion name
          </span>
          <input
            type="text"
            placeholder="e.g. Nameday, First date anniversary"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-600"
          />
        </label>
        <label className="flex flex-col gap-1 sm:max-w-[220px]">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Date
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-600"
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            disabled={!canAdd}
            onClick={handleAdd}
            className={`rounded-lg px-4 py-2 font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              canAdd ? "bg-emerald-600 hover:bg-emerald-700" : "bg-emerald-600"
            }`}
          >
            Add date
          </button>
        </div>
      </div>
      <div className="mt-2">
        <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Added dates
        </h4>
        {combinedDates.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No dates yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {combinedDates.map((d, idx) => (
              <li
                key={`${d.label}-${d.date}-${idx}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <span className="text-slate-700 dark:text-slate-200">
                  <span className="font-medium">{d.label}:</span>{" "}
                  {formatDateForDisplay(d.date)}
                </span>
                {d.label.toLowerCase() !== "birthday" && (
                  <button
                    type="button"
                    onClick={() =>
                      onRemoveDate(idx - (formState.birthday ? 1 : 0))
                    }
                    className="rounded bg-red-50 px-2 py-1 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/40"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SpecialDatesStep;
