import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import type { PanInfo } from "motion/react";
import type {
  MemberProduct,
  MemberProductFormValues,
} from "../../types/member-products";

type AddProductPanelProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: MemberProductFormValues) => void;
  mode?: "create" | "edit";
  editingProduct?: MemberProduct | null;
};

const emptyForm: MemberProductFormValues = {
  name: "",
  url: "",
  price: "",
  notes: "",
};

const toFormState = (
  product?: MemberProduct | null
): MemberProductFormValues => ({
  name: product?.name ?? "",
  url: product?.url ?? "",
  price: product?.priceDisplay ?? "",
  notes: product?.notes ?? "",
});

const AddProductPanel = ({
  open,
  onClose,
  onSubmit,
  mode = "create",
  editingProduct = null,
}: AddProductPanelProps) => {
  const [formState, setFormState] =
    useState<MemberProductFormValues>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const priceInputRef = useRef<HTMLInputElement | null>(null);
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) {
      return;
    }
    setFormState(toFormState(editingProduct));
    setError(null);
    const timer = window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [open, editingProduct]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const { body } = document;
      const previous = body.style.overflow;
      body.style.overflow = "hidden";
      return () => {
        body.style.overflow = previous;
      };
    }
    return;
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const updateIsMobile = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };
    setIsMobile(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateIsMobile);
      return () => mediaQuery.removeEventListener("change", updateIsMobile);
    }

    mediaQuery.addListener(updateIsMobile);
    return () => mediaQuery.removeListener(updateIsMobile);
  }, []);

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = formState.name.trim();
    if (!trimmedName) {
      setError("Please give the product a name.");
      nameInputRef.current?.focus();
      return;
    }
    const trimmedPrice = formState.price.trim();
    if (!trimmedPrice) {
      setError("Please set a target price.");
      priceInputRef.current?.focus();
      return;
    }
    onSubmit({
      name: trimmedName,
      url: formState.url.trim(),
      price: trimmedPrice,
      notes: formState.notes.trim(),
    });
  };

  const panelTitle = useMemo(
    () => (mode === "edit" ? "Edit product" : "Add product"),
    [mode]
  );

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const dragConstraints = useMemo(() => {
    if (!isMobile) {
      return undefined;
    }
    return { top: 0, bottom: 360 };
  }, [isMobile]);

  const handlePanelDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!isMobile) {
        return;
      }
      if (info.offset.y > 80 || info.velocity.y > 600) {
        onClose();
      }
    },
    [isMobile, onClose]
  );

  const handleGrabPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isMobile) {
        return;
      }
      event.stopPropagation();
      dragControls.start(event.nativeEvent, { snapToCursor: false });
    },
    [dragControls, isMobile]
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0 bg-slate-900/40"
            role="presentation"
            onClick={handleBackdropClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative z-10 w-full max-w-xl rounded-t-3xl border border-accent-2/40 bg-primary/95 p-6 text-contrast shadow-2xl md:max-w-2xl md:rounded-3xl md:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={panelTitle}
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.6 }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            drag={isMobile ? "y" : false}
            dragConstraints={dragConstraints}
            dragElastic={isMobile ? { top: 0, bottom: 0.35 } : 0}
            dragMomentum={false}
            dragControls={dragControls}
            dragListener={false}
            onDragEnd={handlePanelDragEnd}
          >
            <div className="flex flex-col gap-4">
              <div className="flex justify-center pt-1.5 sm:hidden">
                <div
                  role="presentation"
                  className="h-1.5 w-16 cursor-grab rounded-full bg-slate-300 transition active:cursor-grabbing dark:bg-slate-700"
                  aria-hidden="true"
                  style={{ touchAction: "none" }}
                  onPointerDown={handleGrabPointerDown}
                />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand/80">
                    {mode === "edit" ? "Update idea" : "New idea"}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-contrast/80">
                Product name
                <input
                  ref={nameInputRef}
                  name="name"
                  value={formState.name}
                  onChange={handleFieldChange}
                  placeholder="e.g. Cozy knit sweater"
                  className="rounded-xl border border-accent-2/60 bg-primary px-3 py-2 text-sm text-contrast shadow-sm focus:border-brand/70 focus:outline-none focus:ring-2 focus:ring-brand/50"
                  required
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-contrast/80">
                Link
                <input
                  name="url"
                  value={formState.url}
                  onChange={handleFieldChange}
                  placeholder="https://example.com/product"
                  className="rounded-xl border border-accent-2/60 bg-primary px-3 py-2 text-sm text-contrast shadow-sm focus:border-brand/70 focus:outline-none focus:ring-2 focus:ring-brand/50"
                  type="url"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-contrast/80">
                Target price
                <input
                  ref={priceInputRef}
                  name="price"
                  value={formState.price}
                  onChange={handleFieldChange}
                  placeholder="e.g. 49.99"
                  className="rounded-xl border border-accent-2/60 bg-primary px-3 py-2 text-sm text-contrast shadow-sm focus:border-brand/70 focus:outline-none focus:ring-2 focus:ring-brand/50"
                  required
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-contrast/80">
                Notes
                <textarea
                  name="notes"
                  value={formState.notes}
                  onChange={handleFieldChange}
                  placeholder="Gift timing, retailer options, sizing tips..."
                  rows={3}
                  className="rounded-xl border border-accent-2/60 bg-primary px-3 py-2 text-sm text-contrast shadow-sm focus:border-brand/70 focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </label>

              {error ? <p className="text-sm text-amber-400">{error}</p> : null}

              <div className="flex justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-accent-2/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-contrast shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/70 focus:ring-offset-2 focus:ring-offset-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl border border-brand/70 bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/70 focus:ring-offset-2 focus:ring-offset-primary"
                >
                  {mode === "edit" ? "Update product" : "Save product"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AddProductPanel;
