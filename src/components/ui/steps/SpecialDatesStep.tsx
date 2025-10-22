import React, { useCallback, useMemo, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import type { FormState } from "../../../types/add-member";
import OccasionDate from "../OccasionDate";
import AnimatedList from "../AnimatedList";
import CustomTextInput from "../CustomTextInput";
import CustomDateInput from "../CustomDateInput";
import { motion, useAnimationControls } from "motion/react";
import type { PanInfo } from "motion/react";

interface SpecialDatesStepProps {
  formState: FormState;

  onAddDate: (entry: { label: string; date: string }) => void;
  onRemoveDate: (index: number) => void;
  onUpdateDate: (index: number, entry: { label: string; date: string }) => void;
}

const SpecialDatesStep: React.FC<SpecialDatesStepProps> = ({
  formState,
  onAddDate,
  onRemoveDate,
  onUpdateDate,
}) => {
  const [label, setLabel] = useState("");
  const [date, setDate] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const clearInputs = useCallback(() => {
    setLabel("");
    setDate("");
  }, []);

  const toInputDateString = useCallback((value: string | Date) => {
    if (typeof value === "string") {
      return value;
    }
    const local = new Date(value.getTime());
    const year = local.getFullYear();
    const month = String(local.getMonth() + 1).padStart(2, "0");
    const day = String(local.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const canSubmit = label.trim().length > 0 && Boolean(date);

  const handleSubmit = useCallback(() => {
    const trimmed = label.trim();
    if (!trimmed || !date) {
      return;
    }

    if (editingIndex !== null) {
      onUpdateDate(editingIndex, { label: trimmed, date });
      setEditingIndex(null);
      clearInputs();
      return;
    }

    onAddDate({ label: trimmed, date });
    clearInputs();
  }, [clearInputs, date, editingIndex, label, onAddDate, onUpdateDate]);

  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
    clearInputs();
  }, [clearInputs]);

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const combinedDates = useMemo(
    () => [
      ...(formState.birthday
        ? [{ label: "Birthday", date: formState.birthday }]
        : []),
      ...formState.specialDates,
    ],
    [formState.birthday, formState.specialDates]
  );

  const handleRemoveSpecial = useCallback(
    (actualIndex: number) => {
      let shouldClear = false;
      setEditingIndex((prev) => {
        if (prev === null) {
          return prev;
        }
        if (prev === actualIndex) {
          shouldClear = true;
          return null;
        }
        if (prev > actualIndex) {
          return prev - 1;
        }
        return prev;
      });
      if (shouldClear) {
        clearInputs();
      }
      onRemoveDate(actualIndex);
    },
    [clearInputs, onRemoveDate]
  );

  const isEditing = editingIndex !== null;
  const submitLabel = isEditing ? "Save" : "Add";

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <CustomTextInput
          label="Occasion name"
          placeholder="e.g. Nameday, First date anniversary"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={handleInputKeyDown}
          containerClassName="flex flex-1 flex-col gap-2"
        />
        <div className="flex flex-1 flex-col gap-2 sm:max-w-[320px]">
          <span className="text-xs font-semibold uppercase tracking-wide text-contrast/80">
            Date
          </span>
          <div className="flex items-center gap-2">
            <CustomDateInput
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onKeyDown={handleInputKeyDown}
              containerClassName="flex-1"
              className="w-full"
              hideLabel
            />
            <div className="flex items-center gap-2">
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-lg border border-accent-3 px-3 py-2 text-sm font-semibold text-contrast transition hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                >
                  Cancel
                </button>
              ) : null}
              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand"
              >
                {submitLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2">
        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-contrast/80">
          Added dates
        </h4>
        {combinedDates.length === 0 ? (
          <p className="text-sm text-contrast/50">No dates yet.</p>
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
              const specialIndex = isBirthday
                ? -1
                : idx - (formState.birthday ? 1 : 0);

              const handleRemove = () => {
                if (specialIndex >= 0) {
                  handleRemoveSpecial(specialIndex);
                }
              };

              const handleEdit = () => {
                if (specialIndex < 0) {
                  return;
                }
                setLabel(d.label);
                setDate(toInputDateString(d.date));
                setEditingIndex(specialIndex);
              };

              return (
                <OccasionListItem
                  key={`${d.label}-${d.date}-${idx}`}
                  label={d.label}
                  date={d.date}
                  disableRemove={isBirthday}
                  onRemove={!isBirthday ? handleRemove : undefined}
                  onEdit={!isBirthday ? handleEdit : undefined}
                  isActive={!isBirthday && editingIndex === specialIndex}
                />
              );
            }}
            getItemKey={(item, index) => `${item.label}-${item.date}-${index}`}
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
  onRemove?: () => void;
  onEdit?: () => void;
  isActive?: boolean;
}

const ACTION_OFFSET = 60;
const SWIPE_THRESHOLD = 28;

function OccasionListItem({
  label,
  date,
  disableRemove = false,
  onRemove,
  onEdit,
  isActive = false,
}: OccasionListItemProps) {
  const canEdit = Boolean(onEdit);
  const canDelete = !disableRemove && Boolean(onRemove);

  if (!canEdit && !canDelete) {
    return (
      <div className="relative">
        <OccasionDate
          label={label}
          date={date}
          className={isActive ? "border-brand/70 ring-1 ring-brand/40" : ""}
        />
      </div>
    );
  }

  const controls = useAnimationControls();
  const [activeAction, setActiveAction] = useState<"edit" | "delete" | null>(
    null
  );
  const [previewAction, setPreviewAction] = useState<"edit" | "delete" | null>(
    null
  );

  const resetPosition = useCallback(() => {
    setActiveAction(null);
    setPreviewAction(null);
    void controls.start({
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 500, damping: 40 },
    });
  }, [controls]);

  const snapToAction = useCallback(
    (action: "edit" | "delete") => {
      setActiveAction(action);
      setPreviewAction(action);
      void controls.start({
        x: action === "edit" ? ACTION_OFFSET : -ACTION_OFFSET,
        opacity: 1,
        transition: { type: "spring", stiffness: 500, damping: 40 },
      });
    },
    [controls]
  );

  const handleDrag = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      if (info.offset.x > 10 && canEdit) {
        setPreviewAction("edit");
      } else if (info.offset.x < -10 && canDelete) {
        setPreviewAction("delete");
      } else {
        setPreviewAction(null);
      }
    },
    [canDelete, canEdit]
  );

  const handleDragEnd = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      const swipe = offset.x + velocity.x * 50;
      if (canEdit && swipe >= SWIPE_THRESHOLD) {
        snapToAction("edit");
      } else if (canDelete && swipe <= -SWIPE_THRESHOLD) {
        snapToAction("delete");
      } else {
        resetPosition();
      }
    },
    [canDelete, canEdit, resetPosition, snapToAction]
  );

  const handleEditClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (canEdit) {
        onEdit?.();
      }
      resetPosition();
    },
    [canEdit, onEdit, resetPosition]
  );

  const handleDeleteClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (canDelete) {
        onRemove?.();
      }
      resetPosition();
    },
    [canDelete, onRemove, resetPosition]
  );

  const overlayAction = previewAction ?? activeAction;
  const showEdit = overlayAction === "edit";
  const showDelete = overlayAction === "delete";
  const overlayPointer =
    activeAction !== null ? "pointer-events-auto" : "pointer-events-none";

  const dragBounds = useMemo(
    () => ({
      left: canDelete ? -ACTION_OFFSET : 0,
      right: canEdit ? ACTION_OFFSET : 0,
    }),
    [canDelete, canEdit]
  );

  return (
    <div className="relative w-full rounded-xl">
      <div
        className={`absolute inset-1 flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-accent-3 bg-primary px-3 py-2 text-contrast transition-colors ${overlayPointer}`}
      >
        {showEdit ? (
          <button
            type="button"
            onClick={handleEditClick}
            aria-label={`Edit ${label}`}
            className="flex h-10 w-10 items-center justify-center rounded-full  bg-primary text-brand transition hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            <FiEdit2 className="text-lg" />
          </button>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full text-brand">
            <FiEdit2 className="text-lg" />
          </div>
        )}
        {showDelete ? (
          <button
            type="button"
            onClick={handleDeleteClick}
            aria-label={`Delete ${label}`}
            className="flex h-10 w-10 items-center justify-center rounded-full  bg-primary text-brand transition hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            <FiTrash2 className="text-lg" />
          </button>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full  text-brand">
            <FiTrash2 className="text-lg" />
          </div>
        )}
      </div>
      <motion.div
        drag="x"
        dragConstraints={dragBounds}
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
        whileTap={{ scale: 1.02 }}
        className="relative z-10"
      >
        <OccasionDate
          label={label}
          date={date}
          className={`${isActive ? "border-brand ring-1 ring-brand" : ""}`}
        />
      </motion.div>
    </div>
  );
}
