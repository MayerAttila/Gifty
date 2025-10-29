import { useCallback, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { motion, useAnimationControls } from "motion/react";
import type { PanInfo } from "motion/react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import type { MemberProduct } from "../../types/member-products";

type MemberProductCardProps = {
  product: MemberProduct;
  onRemove?: (id: string) => void;
  onEdit?: (product: MemberProduct) => void;
  className?: string;
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }
  return date.toLocaleDateString();
};

const ACTION_OFFSET = 116;
const SWIPE_THRESHOLD = 30;

const MemberProductCard = ({
  product,
  onRemove,
  onEdit,
  className = "",
}: MemberProductCardProps) => {
  const controls = useAnimationControls();
  const [isRemoving, setIsRemoving] = useState(false);
  const [activeAction, setActiveAction] = useState<"delete" | "edit" | null>(
    null
  );
  const [previewAction, setPreviewAction] = useState<"delete" | "edit" | null>(
    null
  );
  const [maxHorizontalDrag, setMaxHorizontalDrag] = useState(0);

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
        setMaxHorizontalDrag(0);
      });
  }, [controls]);

  const snapToAction = useCallback(
    (direction: "delete" | "edit") => {
      if ((direction === "edit" && !onEdit) || (direction === "delete" && !onRemove)) {
        resetPosition();
        return;
      }
      setActiveAction(direction);
      setPreviewAction(direction);
      controls.start({
        x: direction === "delete" ? -ACTION_OFFSET : ACTION_OFFSET,
        opacity: 1,
        transition: { type: "spring", stiffness: 520, damping: 42 },
      });
    },
    [controls, onEdit, onRemove, resetPosition]
  );

  const triggerDelete = useCallback(async () => {
    if (isRemoving) {
      return;
    }
    if (!onRemove) {
      resetPosition();
      return;
    }
    setIsRemoving(true);
    await controls.start({
      x: "-110%",
      opacity: 0,
      transition: { duration: 0.25, ease: "easeIn" },
    });
    onRemove(product.id);
    setPreviewAction(null);
    setMaxHorizontalDrag(0);
  }, [controls, isRemoving, onRemove, product.id, resetPosition]);

  const handleDrag = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      if (isRemoving) {
        return;
      }
      const absX = Math.abs(info.offset.x);
      if (absX > maxHorizontalDrag) {
        setMaxHorizontalDrag(absX);
      }
      if (info.offset.x > 10 && onEdit) {
        setPreviewAction("edit");
      } else if (info.offset.x < -10 && onRemove) {
        setPreviewAction("delete");
      } else {
        setPreviewAction(null);
      }
    },
    [isRemoving, maxHorizontalDrag, onEdit, onRemove]
  );

  const handleDragEnd = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      const swipe = offset.x + velocity.x * 50;
      if (swipe <= -SWIPE_THRESHOLD && onRemove) {
        snapToAction("delete");
      } else if (swipe >= SWIPE_THRESHOLD && onEdit) {
        snapToAction("edit");
      } else {
        resetPosition();
        setPreviewAction(null);
        setMaxHorizontalDrag(0);
      }
    },
    [onEdit, onRemove, resetPosition, snapToAction]
  );

  const handleDeleteClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      void triggerDelete();
    },
    [triggerDelete]
  );

  const handleEditClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (onEdit) {
        onEdit(product);
      }
      resetPosition();
      setMaxHorizontalDrag(0);
    },
    [onEdit, product, resetPosition]
  );

  const handleCardTap = useCallback(() => {
    if (activeAction) {
      resetPosition();
      setMaxHorizontalDrag(0);
      return;
    }
    if (isRemoving) {
      setMaxHorizontalDrag(0);
      return;
    }
    if (maxHorizontalDrag > 6) {
      setMaxHorizontalDrag(0);
      return;
    }
    if (onEdit) {
      onEdit(product);
    }
    setMaxHorizontalDrag(0);
  }, [activeAction, isRemoving, maxHorizontalDrag, onEdit, product, resetPosition]);

  const currentAction = previewAction ?? activeAction;
  const showEditAction = currentAction === "edit";
  const showDeleteAction = currentAction === "delete";
  const overlayPointerClass =
    activeAction !== null ? "pointer-events-auto" : "pointer-events-none";

  return (
    <div className="relative w-full select-none overflow-hidden rounded-2xl">
      {currentAction ? (
        <div
          className={`absolute inset-2 flex items-stretch gap-4 overflow-hidden rounded-2xl border border-accent-2/60 bg-primary px-4 py-3 text-contrast shadow-md shadow-slate-500/15 backdrop-blur-sm transition-colors ${overlayPointerClass} ${
            showEditAction && !showDeleteAction
              ? "justify-start"
              : showDeleteAction && !showEditAction
              ? "justify-end"
              : "justify-between"
          }`}
        >
          {showEditAction && onEdit ? (
            <button
              type="button"
              onClick={handleEditClick}
              className="flex min-w-[7rem] flex-col items-center justify-center gap-2 rounded-xl px-4 py-4 text-contrast"
            >
              <FiEdit2 className="text-2xl text-brand" />
              <span className="text-[0.65rem] font-bold text-brand uppercase tracking-[0.4em]">
                Edit
              </span>
            </button>
          ) : null}
          {showDeleteAction && onRemove ? (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="flex min-w-[7rem] flex-col items-center justify-center gap-2 rounded-xl px-4 py-4 text-contrast"
            >
              <FiTrash2 className="text-2xl text-brand" />
              <span className="text-[0.65rem] font-bold text-brand uppercase tracking-[0.4em]">
                Delete
              </span>
            </button>
          ) : null}
        </div>
      ) : null}
      <motion.article
        drag={isRemoving ? false : "x"}
        dragConstraints={{ left: -160, right: 160 }}
        dragElastic={0.2}
        dragMomentum={false}
        animate={controls}
        onDragStart={() => {
          setMaxHorizontalDrag(0);
          controls.stop();
        }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onTap={handleCardTap}
        whileTap={{ scale: 1.03 }}
        className={`relative z-10 flex flex-col gap-4 rounded-2xl border border-accent-2/40 bg-primary/85 p-4 text-contrast shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-start sm:justify-between md:p-5 ${className}`}
      >
        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-contrast sm:text-lg">
              {product.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-contrast/60">
              <span>Added {formatDate(product.createdAt)}</span>
              {product.priceDisplay ? (
                <span className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-brand">
                  {product.priceDisplay}
                </span>
              ) : null}
            </div>
          </div>
          {product.notes ? (
            <p className="text-sm text-contrast/75 sm:text-base">
              {product.notes}
            </p>
          ) : null}
          {product.url ? (
            <a
              href={product.url}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => {
                if (activeAction) {
                  event.preventDefault();
                  resetPosition();
                }
              }}
              className="inline-flex w-max items-center gap-2 rounded-full border border-brand/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand transition hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/70 focus:ring-offset-2 focus:ring-offset-primary"
            >
              View Product
            </a>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 sm:flex-row sm:items-center sm:justify-end">
          {product.updatedAt ? (
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-contrast/50">
              Updated {formatDate(product.updatedAt)}
            </span>
          ) : null}
          {onEdit ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                if (activeAction) {
                  resetPosition();
                  setMaxHorizontalDrag(0);
                  return;
                }
                onEdit(product);
              }}
              className="hidden rounded-full border border-brand/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/70 focus:ring-offset-2 focus:ring-offset-primary sm:inline-flex"
            >
              Edit
            </button>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void triggerDelete();
              }}
              className="hidden rounded-full border border-accent-2/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-contrast shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/70 focus:ring-offset-2 focus:ring-offset-primary sm:inline-flex"
            >
              Remove
            </button>
          ) : null}
        </div>
      </motion.article>
    </div>
  );
};

export default MemberProductCard;
