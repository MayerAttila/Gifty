import React, { useState } from "react";
import type { FormState } from "../AddMemberTypes";

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
    <div className="flex flex-col gap-10 py-4">
      <div className="flex items-end gap-2">
        <label className="flex grow flex-col gap-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Add a like
          </span>
          <input
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
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-600"
          />
        </label>
        <button
          type="button"
          onClick={handleAddLike}
          className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((like) => {
          const active = selectedLower.includes(like.toLowerCase());
          return (
            <button
              type="button"
              key={like}
              onClick={() => onToggleLike(like)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                active
                  ? "bg-emerald-500 text-white shadow shadow-emerald-400/50"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {like}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LikingsStep;
