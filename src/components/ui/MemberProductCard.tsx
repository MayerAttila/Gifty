import { useCallback, useRef, useState } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  MouseEventHandler as ReactMouseEventHandler,
} from "react";
import { motion, useAnimationControls } from "motion/react";
import type { PanInfo } from "motion/react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import type { MemberProduct } from "../../types/member-products";
import ProductPriceBadge from "./ProductPriceBadge";

type MemberProductCardProps = {
  product: MemberProduct;
  onRemove?: (id: string) => void;
  onEdit?: (product: MemberProduct) => void;
  className?: string;
  toneIndex?: number;
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
  toneIndex = 0,
}: MemberProductCardProps) => {
  const controls = useAnimationControls();
  const [isRemoving, setIsRemoving] = useState(false);
  const [activeAction, setActiveAction] = useState<"delete" | "edit" | null>(
    null
  );
  const [previewAction, setPreviewAction] = useState<"delete" | "edit" | null>(
    null
  );
  const maxHorizontalDragRef = useRef(0);

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
  }, [controls, isRemoving, onRemove, product.id, resetPosition]);

  const handleDrag = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      if (isRemoving) {
        return;
      }
      const absX = Math.abs(info.offset.x);
      if (absX > maxHorizontalDragRef.current) {
        maxHorizontalDragRef.current = absX;
      }
      if (info.offset.x > 10) {
        setPreviewAction("edit");
      } else if (info.offset.x < -10) {
        setPreviewAction("delete");
      }
    },
    [isRemoving]
  );

  const handleDragEnd = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      const swipe = offset.x + velocity.x * 50;
      const absOffset = Math.abs(offset.x);
      if (absOffset > maxHorizontalDragRef.current) {
        maxHorizontalDragRef.current = absOffset;
      }
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
    },
    [onEdit, product, resetPosition]
  );

  const handleCardTap = useCallback(() => {
    if (activeAction) {
      resetPosition();
      maxHorizontalDragRef.current = 0;
      return;
    }
    if (isRemoving) {
      maxHorizontalDragRef.current = 0;
      return;
    }
    if (maxHorizontalDragRef.current > 6) {
      maxHorizontalDragRef.current = 0;
      return;
    }
    if (onEdit) {
      onEdit(product);
    }
    maxHorizontalDragRef.current = 0;
  }, [activeAction, isRemoving, onEdit, product, resetPosition]);

  const handleClickCapture: ReactMouseEventHandler<HTMLDivElement> =
    useCallback(
      (event) => {
        if (
          activeAction ||
          previewAction ||
          isRemoving ||
          maxHorizontalDragRef.current > 6
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      [activeAction, previewAction, isRemoving]
    );

  const currentAction = previewAction ?? activeAction;
  const showEditAction = currentAction === "edit";
  const showDeleteAction = currentAction === "delete";
  const overlayPointerClass =
    activeAction !== null ? "pointer-events-auto" : "pointer-events-none";
  const tone =
    toneIndex % 2 === 0
      ? "bg-gradient-to-bl from-brand/20 via-primary to-brand/20"
      : "bg-gradient-to-bl from-accent-2/10 via-brand/20 to-accent-1/10";
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
      <motion.div
        drag={isRemoving ? false : "x"}
        dragConstraints={{ left: -160, right: 160 }}
        dragElastic={0.2}
        dragMomentum={false}
        animate={controls}
        onDragStart={() => {
          maxHorizontalDragRef.current = 0;
          controls.stop();
        }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onTap={handleCardTap}
        onClickCapture={handleClickCapture}
        whileTap={{ scale: 1.03 }}
        className={`relative z-10 flex w-full flex-col gap-4 rounded-xl border border-accent-2/40 ${tone} bg-primary p-5 text-contrast shadow-md transition-[background-color,border-color] duration-200 ${className}`}
      >
        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-contrast">
                {product.name}
              </h3>
              <ProductPriceBadge
                priceDisplay={product.priceDisplay}
                priceValue={product.priceValue}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-contrast/60">
              <span>Added {formatDate(product.createdAt)}</span>
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
              className="inline-flex w-max items-center gap-2 rounded-full border border-brand/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand transition hover:-translate-y-0.5 hover:shadow-sm focus:outline-none"
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
                  maxHorizontalDragRef.current = 0;
                  return;
                }
                onEdit(product);
              }}
              className="hidden rounded-full border border-brand/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none sm:inline-flex"
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
              className="hidden rounded-full border border-accent-2/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-contrast shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none sm:inline-flex"
            >
              Remove
            </button>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};

export default MemberProductCard;
