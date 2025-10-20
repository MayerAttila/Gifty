import React, { useCallback, useMemo, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import type { PanInfo } from "motion/react";
import type { Member } from "./AddMemberTypes";

interface MemberCardProps extends Member {
  className?: string;
  onDelete?: () => void;
  onEdit?: () => void;
}

const ACTION_OFFSET = 80;
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

  const resetPosition = useCallback(() => {
    setActiveAction(null);
    controls.start({
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 500, damping: 40 },
    });
  }, [controls]);

  const snapToAction = useCallback(
    (direction: "delete" | "edit") => {
      setActiveAction(direction);
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

  const formattedBirthday = useMemo(() => {
    const date = new Date(`${birthday}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return birthday;
    }
    return date.toLocaleDateString();
  }, [birthday]);

  const formattedSpecialDates = useMemo(() => {
    if (!specialDates || specialDates.length === 0) {
      return [];
    }
    return specialDates
      .filter((entry) => entry.label.toLowerCase() !== "birthday")
      .map((entry) => {
        const parsed = new Date(`${entry.date}T00:00:00`);
        return {
          label: entry.label,
          value: Number.isNaN(parsed.getTime())
            ? entry.date
            : parsed.toLocaleDateString(),
        };
      });
  }, [specialDates]);

  return (
    <div className="relative w-full select-none overflow-hidden rounded-xl">
      <div
        className={`absolute inset-0 flex items-center justify-start bg-blue-600 pl-3 transition-opacity duration-200 ${
          activeAction === "edit"
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-50"
        }`}
      >
        <button
          type="button"
          onClick={handleEditClick}
          className="flex h-full w-full items-center justify-start bg-transparent text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <span
            className="text-lg font-semibold uppercase tracking-[0.15em] text-white"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Edit
          </span>
        </button>
      </div>
      <div
        className={`absolute inset-0 flex items-center justify-end bg-red-600 pr-3 transition-opacity duration-200 ${
          activeAction === "delete"
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-50"
        }`}
      >
        <button
          type="button"
          onClick={handleDeleteClick}
          className="flex h-full w-full items-center justify-end bg-transparent text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <span
            className="text-lg font-semibold uppercase tracking-[0.15em] text-white"
            style={{ writingMode: "vertical-rl" }}
          >
            Delete
          </span>
        </button>
      </div>
      <motion.div
        drag={isDeleting ? false : "x"}
        dragConstraints={{ left: -160, right: 160 }}
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
        whileTap={{ scale: 1.03 }}
        className={`relative z-10 w-full rounded-xl border border-transparent bg-white p-4 shadow-md transition-[background-color,border-color] duration-200 dark:bg-slate-800 dark:shadow-lg ${className}`}
      >
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {name}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Connection: {connection}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Gender: {gender}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Birthday: {formattedBirthday}
        </p>
        {formattedSpecialDates.map((entry) => (
          <p
            key={`${entry.label}-${entry.value}`}
            className="text-sm text-slate-600 dark:text-slate-400"
          >
            {entry.label}: {entry.value}
          </p>
        ))}
        {likings && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Likes: {likings}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export type { Member, MemberCardProps };
export default MemberCard;
