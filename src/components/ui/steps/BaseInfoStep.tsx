import React from "react";
import type { ChangeEvent } from "react";
import type { FormState } from "../../../types/add-member";
import SelectableBadge from "../SelectableBadge";
import CustomTextInput from "../CustomTextInput";
import CustomDateInput from "../CustomDateInput";

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
        <CustomTextInput
          required
          name="name"
          label="Loved ones name"
          value={formState.name}
          onChange={onFieldChange}
        />
        <CustomDateInput
          name="birthday"
          label="Birthday"
          value={formState.birthday}
          onChange={onFieldChange}
          containerClassName="sm:max-w-[220px]"
        />

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-contrast/80">
            Gender
          </span>
          <div className="flex flex-wrap justify-between gap-2">
            {["Male", "Female"].map((option) => {
              const value = option.toLowerCase();
              const isSelected = formState.gender.toLowerCase() === value;
              return (
                <label
                  key={value}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                    isSelected
                      ? "border-brand bg-brand/15 text-brand"
                      : "border-accent-3 text-contrast hover:border-brand/40 hover:text-brand"
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    checked={isSelected}
                    onChange={onFieldChange}
                    className="sr-only"
                  />
                  {option}
                </label>
              );
            })}
          </div>
        </div>
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
              <SelectableBadge
                key={rel}
                label={rel}
                isActive={isActive}
                onClick={() => onSelectConnection(rel)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BaseInfoStep;
