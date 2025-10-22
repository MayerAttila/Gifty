import React, { useState } from "react";
import type { FormState } from "../../../types/add-member";
import CustomTextInput from "../CustomTextInput";
import SelectableBadge from "../SelectableBadge";

interface LikingsStepProps {
  formState: FormState;
  onToggleLike: (value: string) => void;
}

const LikingsStep: React.FC<LikingsStepProps> = ({ formState, onToggleLike }) => {
  const [newLike, setNewLike] = useState("");
  const gender = formState.gender.toLowerCase();
  const maleLikes = ["Gadgets", "Sports", "Gaming", "Watches"];
  const femaleLikes = ["Skincare", "Jewelry", "Books", "Candles"];
  const neutralLikes = ["Coffee", "Travel", "Plants", "Art"];
  const suggestions = [
    ...(gender === "male" ? maleLikes : femaleLikes),
    ...neutralLikes,
  ];
  const selectedRaw = formState.likings
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const selectedLower = selectedRaw.map((s) => s.toLowerCase());
  const chips = [
    ...selectedRaw,
    ...suggestions.filter((s) => !selectedLower.includes(s.toLowerCase())),
  ];

  const handleAddLike = () => {
    const value = newLike.trim();
    if (!value) return;
    if (!selectedLower.includes(value.toLowerCase())) {
      onToggleLike(value);
    }
    setNewLike("");
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      <div className="flex items-end gap-2">
        <CustomTextInput
          containerClassName="flex grow flex-col gap-2"
          label="Add a like"
          type="text"
          placeholder="e.g. Sneakers, Anime, Lego"
          value={newLike}
          onChange={(e) => setNewLike(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddLike();
            }
          }}
        />
        <button
          type="button"
          onClick={handleAddLike}
          className="h-10 rounded-lg bg-brand px-4 text-sm font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/70 focus:ring-offset-2 focus:ring-offset-primary"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((like) => {
          const active = selectedLower.includes(like.toLowerCase());
          return (
            <SelectableBadge
              key={like}
              label={like}
              isActive={active}
              onClick={() => onToggleLike(like)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default LikingsStep;
