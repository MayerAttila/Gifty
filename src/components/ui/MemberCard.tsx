import React, { useCallback, useMemo, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import type { PanInfo } from "motion/react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import type { Member } from "./AddMemberTypes";
import OccasionDate from "./OccasionDate";
import AnimatedList from "./AnimatedList";

interface MemberCardProps extends Member {
  className?: string;
  onDelete?: () => void;
  onEdit?: () => void;
}

const ACTION_OFFSET = 116;
const SWIPE_THRESHOLD = 30;

const MemberCard: React.FC<MemberCardProps> = ({
  name,
  gender,
  birthday,
  connection,
  likings,
  specialDates,
  className = "",
  onDelete,
  onEdit,
}) => {
  const controls = useAnimationControls();
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeAction, setActiveAction] = useState<"delete" | "edit" | null>(
    null
  );
  const [previewAction, setPreviewAction] = useState<
    "delete" | "edit" | null
  >(null);

  const resetPosition = useCallback(() => {
    setActiveAction(null);
    setPreviewAction(null);
    controls.start({
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 500, damping: 40 },
    });
  }, [controls]);

  const snapToAction = useCallback(
    (direction: "delete" | "edit") => {
      setActiveAction(direction);
      setPreviewAction(direction);
      controls.start({
        x: direction === "delete" ? -ACTION_OFFSET : ACTION_OFFSET,
        opacity: 1,
        transition: { type: "spring", stiffness: 500, damping: 40 },
      });
    },
    [controls]
  );

  const triggerDelete = useCallback(async () => {
    if (isDeleting) {
      return;
    }
    if (!onDelete) {
      resetPosition();
      return;
    }
    setIsDeleting(true);
    await controls.start({
      x: "-110%",
      opacity: 0,
      transition: { duration: 0.25, ease: "easeIn" },
    });
    onDelete();
    setPreviewAction(null);
  }, [controls, isDeleting, onDelete, resetPosition]);

  const handleDragEnd = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      const swipe = offset.x + velocity.x * 50;
      if (swipe <= -SWIPE_THRESHOLD) {
        snapToAction("delete");
      } else if (swipe >= SWIPE_THRESHOLD) {
        snapToAction("edit");
      } else {
        resetPosition();
        setPreviewAction(null);
      }
    },
    [resetPosition, snapToAction]
  );

  const handleDeleteClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      void triggerDelete();
    },
    [triggerDelete]
  );

  const handleEditClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (onEdit) {
        onEdit();
      }
      resetPosition();
    },
    [onEdit, resetPosition]
  );

  const normalizedBirthday = useMemo(() => {
    if (!birthday) {
      return null;
    }
    if (birthday instanceof Date) {
      return Number.isNaN(birthday.getTime()) ? null : birthday;
    }
    const parsed = new Date(birthday);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [birthday]);

  const normalizedSpecialDates = useMemo(() => {
    if (!specialDates || specialDates.length === 0) {
      return [];
    }
    return specialDates
      .filter((entry) => entry.label.toLowerCase() !== "birthday")
      .map((entry) => {
        const parsed =
          entry.date instanceof Date ? entry.date : new Date(entry.date);
        if (Number.isNaN(parsed.getTime())) {
          return null;
        }
        return { label: entry.label, date: parsed };
      })
      .filter(
        (entry): entry is { label: string; date: Date } => entry !== null
      );
  }, [specialDates]);

  const sortedOccasions = useMemo(() => {
    const items: Array<{ label: string; date: Date; nextOccurrence: Date }> =
      [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calcNextOccurrence = (original: Date) => {
      const event = new Date(original);
      const next = new Date(today);
      next.setMonth(event.getMonth(), event.getDate());
      next.setHours(0, 0, 0, 0);
      if (Number.isNaN(next.getTime())) {
        return null;
      }
      if (next < today) {
        next.setFullYear(next.getFullYear() + 1);
      }
      return next;
    };

    if (normalizedBirthday) {
      const next = calcNextOccurrence(normalizedBirthday);
      if (next) {
        items.push({
          label: "Birthday",
          date: normalizedBirthday,
          nextOccurrence: next,
        });
      }
    }
    if (normalizedSpecialDates.length > 0) {
      normalizedSpecialDates.forEach((entry) => {
        const next = calcNextOccurrence(entry.date);
        if (next) {
          items.push({
            label: entry.label,
            date: entry.date,
            nextOccurrence: next,
          });
        }
      });
    }
    const sorted = items.sort(
      (a, b) => a.nextOccurrence.getTime() - b.nextOccurrence.getTime()
    );
    return sorted.map(({ label, date }) => ({ label, date }));
  }, [normalizedBirthday, normalizedSpecialDates]);

  const genderTone = useMemo(() => {
    const normalized = (gender ?? "").trim().toLowerCase();

    switch (normalized) {
      case "male":
        return {
          gradient:
            "bg-gradient-to-br from-sky-200 via-white to-sky-200 dark:from-slate-900 dark:via-sky-900/40 dark:to-slate-900",
          accent: "text-sky-700 dark:text-sky-200",
        };
      case "female":
        return {
          gradient:
            "bg-gradient-to-br from-rose-200 via-white to-rose-200 dark:from-slate-900 dark:via-rose-900/40 dark:to-slate-900",
          accent: "text-rose-700 dark:text-rose-200",
        };
      default:
        return {
          gradient:
            "bg-gradient-to-br from-slate-50 via-white to-white dark:from-slate-900 dark:via-slate-800/40 dark:to-slate-900",
          accent: "text-slate-700 dark:text-slate-200",
        };
    }
  }, [gender]);

  const genderLabel = useMemo(() => {
    const raw = (gender ?? "").trim();
    if (!raw) {
      return "Unspecified";
    }
    return raw.replace(/\b\w/g, (char) => char.toUpperCase());
  }, [gender]);

  const currentAction = previewAction ?? activeAction;
  const showEditAction = currentAction === "edit";
  const showDeleteAction = currentAction === "delete";

  const handleDrag = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      if (isDeleting) {
        return;
      }
      if (info.offset.x > 10) {
        setPreviewAction("edit");
      } else if (info.offset.x < -10) {
        setPreviewAction("delete");
      } else {
        setPreviewAction(null);
      }
    },
    [isDeleting]
  );

  return (
    <div className="relative w-full select-none overflow-hidden rounded-xl">
      {currentAction && (
        <div
          className={`absolute inset-2 flex items-stretch gap-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white shadow-md ${
            showEditAction && !showDeleteAction
              ? "justify-start"
              : showDeleteAction && !showEditAction
                ? "justify-end"
                : "justify-between"
          }`}
        >
          {showEditAction ? (
            <button
              type="button"
              onClick={handleEditClick}
              aria-label="Edit member"
              className="flex min-w-[7rem] flex-col items-center justify-center gap-2 px-4 py-4 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <FiEdit2 className="text-2xl" />
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.4em]">
                Edit
              </span>
            </button>
          ) : null}
          {showDeleteAction ? (
            <button
              type="button"
              onClick={handleDeleteClick}
              aria-label="Delete member"
              className="flex min-w-[7rem] flex-col items-center justify-center gap-2 px-4 py-4 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <FiTrash2 className="text-2xl" />
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.4em]">
                Delete
              </span>
            </button>
          ) : null}
        </div>
      )}
      <motion.div
        drag={isDeleting ? false : "x"}
        dragConstraints={{ left: -160, right: 160 }}
        dragElastic={0.2}
        dragMomentum={false}
        animate={controls}
        onDragStart={() => {
          controls.stop();
          if (!isDeleting) {
            setActiveAction(null);
            setPreviewAction(null);
          }
        }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onTap={() => {
          if (activeAction) {
            resetPosition();
          }
        }}
        whileTap={{ scale: 1.03 }}
        className={`relative z-10 flex w-full flex-col gap-4 rounded-xl  ${genderTone.gradient} bg-white dark:bg-slate-900 p-5 shadow-md transition-[background-color,border-color] duration-200 dark:shadow-lg ${className}`}
      >
        <span className="sr-only">Gender: {genderLabel}</span>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {name}
          </h2>
          {connection ? (
            <span
              className={`rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/10 ${genderTone.accent}`}
            >
              {connection}
            </span>
          ) : null}
        </div>

        {sortedOccasions.length > 0 && (
          <div className="space-y-2">
            <AnimatedList
              items={sortedOccasions}
              showGradients={false}
              enableArrowNavigation={false}
              displayScrollbar
              scrollContainerClassName="max-h-[8.5rem] min-h-[3.5rem] overflow-y-auto space-y-2 px-1 bg-transparent dark:bg-transparent"
              className="w-full p-0"
              getItemKey={(item, index) =>
                `${item.label}-${item.date.getTime()}-${index}`
              }
              renderItem={(item, index) => (
                <OccasionDate
                  label={item.label}
                  date={item.date}
                  className={
                    index === 0
                      ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/50 dark:bg-emerald-500/10"
                      : ""
                  }
                />
              )}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export type { Member, MemberCardProps };
export default MemberCard;
