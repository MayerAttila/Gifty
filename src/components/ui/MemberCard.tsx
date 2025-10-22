import React, { useCallback, useMemo, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import type { PanInfo } from "motion/react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import type { Member } from "../../types/add-member";
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
  const [previewAction, setPreviewAction] = useState<"delete" | "edit" | null>(
    null
  );

  const resetPosition = useCallback(() => {
    void controls
      .start({
        x: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 500, damping: 40 },
      })
      .then(() => {
        setActiveAction(null);
        setPreviewAction(null);
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
          background: "bg-gradient-to-br from-brand/20 via-primary to-brand/20",
          accent: "text-accent-2",
          badge: "border-brand/40 bg-brand/10 text-brand",
        };
      case "female":
        return {
          background:
            "bg-gradient-to-br from-accent-2/10 via-brand/20 to-accent-1/10",
          accent: "text-brand",
          badge: "border-brand/40 bg-brand/10 text-brand",
        };
      default:
        return {
          background:
            "bg-gradient-to-br from-accent-3/20 via-primary to-accent-2/15",
          accent: "text-contrast",
          badge: "border-contrast/20 bg-contrast/10 text-contrast",
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
  const overlayPointerClass =
    activeAction !== null ? "pointer-events-auto" : "pointer-events-none";

  const handleDrag = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      if (isDeleting) {
        return;
      }
      if (info.offset.x > 10) {
        setPreviewAction("edit");
      } else if (info.offset.x < -10) {
        setPreviewAction("delete");
      }
    },
    [isDeleting]
  );

  return (
    <div className="relative w-full select-none overflow-hidden rounded-xl">
      {currentAction && (
        <div
          className={`absolute inset-2 flex items-stretch gap-4 overflow-hidden rounded-2xl border border-accent-2/60 bg-primary px-4 py-3 text-contrast shadow-md shadow-slate-500/15 backdrop-blur-sm transition-colors ${overlayPointerClass} ${
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
              className="flex min-w-[7rem] flex-col items-center justify-center gap-2 rounded-xl px-4 py-4 text-contrast "
            >
              <FiEdit2 className="text-2xl text-brand" />
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
              className="flex min-w-[7rem] flex-col items-center justify-center gap-2 rounded-xl px-4 py-4 text-contrast "
            >
              <FiTrash2 className="text-2xl text-brand" />
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
        }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onTap={() => {
          if (activeAction) {
            resetPosition();
          }
        }}
        whileTap={{ scale: 1.03 }}
        className={`relative z-10 flex w-full flex-col gap-4 rounded-xl ${genderTone.background} bg-primary p-5 text-contrast shadow-md transition-[background-color,border-color] duration-200 ${className}`}
      >
        <span className="sr-only">Gender: {genderLabel}</span>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold text-contrast">{name}</h2>
          {connection ? (
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm backdrop-blur-sm ${genderTone.badge}`}
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
              scrollContainerClassName="max-h-[7rem] min-h-[3.5rem] overflow-y-auto space-y-2 px-1 bg-transparent dark:bg-transparent"
              className="w-full p-0"
              getItemKey={(item, index) =>
                `${item.label}-${item.date.getTime()}-${index}`
              }
              renderItem={(item, index) => (
                <OccasionDate
                  label={item.label}
                  date={item.date}
                  className={
                    index === 0 ? "border-brand/60 bg-brand/10 text-brand" : ""
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
