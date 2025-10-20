import React, { useCallback, useMemo, useState } from "react";
import type { FormState } from "../AddMemberTypes";
import OccasionDate from "../OccasionDate";
import AnimatedList from "../AnimatedList";
import { motion, useAnimationControls } from "motion/react";
import type { PanInfo } from "motion/react";

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

  const combinedDates = useMemo(
    () => [
      ...(formState.birthday
        ? [{ label: "Birthday", date: formState.birthday }]
        : []),
      ...formState.specialDates,
    ],
    [formState.birthday, formState.specialDates]
  );

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
          <AnimatedList
            items={combinedDates}
            showGradients={false}
            enableArrowNavigation={false}
            displayScrollbar
            scrollContainerClassName="max-h-[17.5rem] min-h-[6rem] overflow-y-auto space-y-2 pr-1"
            className="p-0"
            renderItem={(d, idx) => {
              const isBirthday = d.label.toLowerCase() === "birthday";
              const handleRemove = () =>
                onRemoveDate(idx - (formState.birthday ? 1 : 0));

              return (
                <OccasionListItem
                  key={`${d.label}-${d.date}-${idx}`}
                  label={d.label}
                  date={d.date}
                  disableRemove={isBirthday}
                  onRemove={handleRemove}
                />
              );
            }}
            getItemKey={(item, index) =>
              `${item.label}-${item.date}-${index}`
            }
          />
        )}
      </div>
    </div>
  );
};

export default SpecialDatesStep;

interface OccasionListItemProps {
  label: string;
  date: string;
  disableRemove?: boolean;
  onRemove: () => void;
}

const ACTION_OFFSET = 72;
const SWIPE_THRESHOLD = 24;

function OccasionListItem({
  label,
  date,
  disableRemove = false,
  onRemove,
}: OccasionListItemProps) {
  const controls = useAnimationControls();
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeAction, setActiveAction] = useState<"delete" | null>(null);

  const resetPosition = useCallback(() => {
    setActiveAction(null);
    controls.start({
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 500, damping: 40 },
    });
  }, [controls]);

  const snapToDelete = useCallback(() => {
    setActiveAction("delete");
    controls.start({
      x: -ACTION_OFFSET,
      opacity: 1,
      transition: { type: "spring", stiffness: 500, damping: 40 },
    });
  }, [controls]);

  const triggerDelete = useCallback(async () => {
    if (isDeleting || disableRemove) {
      return;
    }
    setIsDeleting(true);
    await controls.start({
      x: "-110%",
      opacity: 0,
      transition: { duration: 0.25, ease: "easeIn" },
    });
    onRemove();
  }, [controls, disableRemove, isDeleting, onRemove]);

  const handleDragEnd = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      if (disableRemove) {
        return;
      }
      const swipe = info.offset.x + info.velocity.x * 50;
      if (swipe <= -SWIPE_THRESHOLD) {
        snapToDelete();
      } else {
        resetPosition();
      }
    },
    [disableRemove, resetPosition, snapToDelete]
  );

  const handleDeleteClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      void triggerDelete();
    },
    [triggerDelete]
  );

  if (disableRemove) {
    return <OccasionDate label={label} date={date} />;
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <div
        className={`absolute inset-0 flex items-center justify-end bg-red-600 pr-3 transition-opacity duration-200 ${
          activeAction === "delete"
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-60"
        }`}
      >
        <button
          type="button"
          onClick={handleDeleteClick}
          className="flex h-full items-center justify-center rounded-full bg-white/10 px-3 py-1 text-sm font-semibold uppercase tracking-widest text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          Delete
        </button>
      </div>
      <motion.div
        drag={isDeleting ? false : "x"}
        dragConstraints={{ left: -ACTION_OFFSET * 2, right: 0 }}
        dragElastic={0.2}
        dragMomentum={false}
        animate={controls}
        onDragStart={() => {
          controls.stop();
        }}
        onDragEnd={handleDragEnd}
        onTap={() => {
          if (activeAction) {
            resetPosition();
          }
        }}
        whileTap={{ scale: 1.02 }}
        className="relative z-10"
      >
        <OccasionDate label={label} date={date} />
      </motion.div>
    </div>
  );
}
