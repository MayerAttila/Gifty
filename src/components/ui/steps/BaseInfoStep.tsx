import React from "react";
import type { ChangeEvent } from "react";
import type { FormState } from "../AddMemberTypes";

interface BaseInfoStepProps {
  formState: FormState;
  onFieldChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSelectConnection: (value: string) => void;
}

const BaseInfoStep: React.FC<BaseInfoStepProps> = ({
  formState,
  onFieldChange,
  onSelectConnection,
}) => {
  const gender = formState.gender.toLowerCase();
  const relationshipSuggestions = (
    gender === "male"
      ? ["Family", "Boyfriend", "Husband", "Friend", "Best friend"]
      : ["Family", "Girlfriend", "Wife", "Friend", "Best friend"]
  ).map((s) => s);

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-contrast/80">
            Name
          </span>
          <input
            required
            name="name"
            type="text"
            value={formState.name}
            onChange={onFieldChange}
            className="rounded-lg border border-accent-2/60 bg-primary px-3 py-2 text-sm text-contrast shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/70"
          />
        </label>
        <label className="flex flex-col gap-2 sm:max-w-[220px]">
          <span className="text-xs font-semibold uppercase tracking-wide text-contrast/80">
            Birthday
          </span>
          <input
            name="birthday"
            type="date"
            value={formState.birthday}
            onChange={onFieldChange}
            className="rounded-lg border border-accent-2/60 bg-primary px-3 py-2 text-sm text-contrast shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/70"
          />
        </label>

        <fieldset className="flex flex-col gap-3 rounded-xl border border-accent-2/60 bg-primary p-4">
          <legend className="text-xs font-semibold uppercase tracking-wide text-contrast/80">
            Gender
          </legend>
          <div className="flex flex-wrap gap-3">
            {["Male", "Female"].map((option) => {
              const value = option.toLowerCase();
              const isSelected = formState.gender.toLowerCase() === value;
              return (
                <label
                  key={value}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                    isSelected
                      ? "border-brand bg-brand/15 text-brand"
                      : "border-accent-2/60 text-contrast/80 hover:border-brand/40 hover:text-brand"
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    checked={isSelected}
                    onChange={onFieldChange}
                    className="accent-brand"
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
      <div className="space-y-3">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-contrast/80">
            Connection
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {relationshipSuggestions.map((rel) => {
            const isActive =
              formState.connection.toLowerCase() === rel.toLowerCase();
            return (
              <button
                key={rel}
                type="button"
                onClick={() => onSelectConnection(rel)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  isActive
                    ? "bg-brand text-contrast shadow-sm shadow-brand/40"
                    : "bg-primary text-contrast border border-brand"
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
