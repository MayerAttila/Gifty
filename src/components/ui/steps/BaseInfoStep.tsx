import React from "react";
import type { ChangeEvent } from "react";
import type { FormState } from "../AddMemberTypes";

interface BaseInfoStepProps {
  formState: FormState;
  onFieldChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  isAgeValid: boolean;
  onSelectRelationship: (value: string) => void;
}

const BaseInfoStep: React.FC<BaseInfoStepProps> = ({
  formState,
  onFieldChange,
  isAgeValid,
  onSelectRelationship,
}) => {
  const gender = formState.gender.toLowerCase();
  const relationshipSuggestions = (
    gender === "male"
      ? ["Family", "Boyfriend", "Husband", "Friend", "Best friend"]
      : ["Family", "Girlfriend", "Wife", "Friend", "Best friend"]
  ).map((s) => s);

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Name
          </span>
          <input
            required
            name="name"
            type="text"
            value={formState.name}
            onChange={onFieldChange}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-600"
          />
        </label>
        <label className="flex flex-col gap-1 sm:max-w-[220px]">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Birthday
          </span>
          <input
            name="birthday"
            type="date"
            value={formState.birthday}
            onChange={onFieldChange}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-600"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Gender
          </legend>
          <div className="flex flex-wrap gap-3">
            {["Male", "Female"].map((option) => {
              const value = option.toLowerCase();
              const isSelected = formState.gender.toLowerCase() === value;
              return (
                <label
                  key={value}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                    isSelected
                      ? "border-emerald-400 bg-emerald-50 font-semibold shadow-sm shadow-emerald-200/70 dark:border-emerald-600 dark:bg-emerald-900/30"
                      : "border-slate-300 bg-white hover:border-emerald-200 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-900"
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    checked={isSelected}
                    onChange={onFieldChange}
                    className="accent-emerald-500"
                  />
                  <span className="text-slate-700 dark:text-slate-200">
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
      {!isAgeValid && formState.age && (
        <p className="text-sm text-red-500">Please enter a valid age.</p>
      )}
      <div className="mt-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Connection
          </span>
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {relationshipSuggestions.map((rel) => {
            const isActive =
              formState.relationship.toLowerCase() === rel.toLowerCase();
            return (
              <button
                key={rel}
                type="button"
                onClick={() => onSelectRelationship(rel)}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  isActive
                    ? "bg-emerald-500 text-white shadow shadow-emerald-400/50"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {rel}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BaseInfoStep;
