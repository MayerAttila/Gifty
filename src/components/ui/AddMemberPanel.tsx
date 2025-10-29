import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import type { PanInfo } from "motion/react";
import { FiCheck, FiCircle, FiDisc } from "react-icons/fi";
import Stepper, { Step } from "./Stepper";
import type {
  AddMemberFormValues,
  FormState,
  Member,
} from "../../types/add-member";
import BaseInfoStep from "./steps/BaseInfoStep";
import LikingsStep from "./steps/LikingsStep";
import SpecialDatesStep from "./steps/SpecialDatesStep";
// import of date util not needed here

// Types moved to src/types/add-member

interface AddMemberPanelProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AddMemberFormValues) => void;
  mode?: "create" | "edit";
  editingMember?: Member | null;
}

// FormState type imported from src/types/add-member

const createEmptyFormState = (): FormState => ({
  name: "",
  gender: "male",
  birthday: "",
  connection: "",
  likings: "",
  specialDates: [],
});

const toDateInputValue = (date: Date) => {
  const local = new Date(date.getTime());
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toFormState = (
  source?: Member | AddMemberFormValues | (Member & { birthday?: Date }) | null
): FormState => {
  const base = createEmptyFormState();
  if (!source) {
    return base;
  }

  const normalizedGender = source.gender
    ? source.gender.toLowerCase()
    : base.gender;

  const normalizedSpecialDates: FormState["specialDates"] = [];
  let birthdayValue = "";

  (source.specialDates ?? []).forEach((entry) => {
    const { label, date } = entry;
    if (typeof label !== "string") {
      return;
    }
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      return;
    }
    const parsed =
      date instanceof Date ? new Date(date.getTime()) : new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return;
    }
    if (trimmedLabel.toLowerCase() === "birthday" && !birthdayValue) {
      birthdayValue = toDateInputValue(parsed);
      return;
    }
    normalizedSpecialDates.push({
      label: trimmedLabel,
      date: toDateInputValue(parsed),
    });
  });

  if (!birthdayValue && "birthday" in source && source?.birthday) {
    const legacyBirthday = source.birthday;
    const parsed =
      legacyBirthday instanceof Date
        ? new Date(legacyBirthday.getTime())
        : new Date(legacyBirthday);
    if (!Number.isNaN(parsed.getTime())) {
      birthdayValue = toDateInputValue(parsed);
    }
  }

  return {
    name: source.name ?? base.name,
    gender: normalizedGender || base.gender,
    birthday: birthdayValue,
    connection: source.connection ?? base.connection,
    likings: source.likings ?? base.likings,
    specialDates: normalizedSpecialDates,
  };
};

const stepDescriptors = [
  { title: "Info", subtitle: "Basics + how you're connected." },
  { title: "Likings", subtitle: "Interests and gift ideas." },
  { title: "Dates", subtitle: "Birthdays, namedays, anniversaries." },
] as const;

// Date formatter imported from utils/date

const StepBadge: React.FC<{
  step: number;
  currentStep: number;
  label: string;
  onClick: () => void;
}> = ({ step, currentStep, label, onClick }) => {
  const isActive = currentStep === step;
  const isComplete = currentStep > step;
  const badgeStyles: CSSProperties = isActive
    ? {
        backgroundColor: "rgb(var(--color-brand) / 1)",
        color: "rgb(var(--color-primary) / 1)",
        boxShadow: "0 12px 26px rgb(var(--color-brand) / 0.32)",
      }
    : isComplete
    ? {
        backgroundColor: "rgb(var(--color-brand) / 1)",
        color: "rgb(var(--color-primary) / 1)",
        boxShadow: "0 12px 26px rgb(var(--color-brand) / 0.32)",
      }
    : {
        backgroundColor: "rgb(var(--color-accent-3) / 1)",
        color: "rgb(var(--color-contrast) / 0.78)",
        boxShadow: "inset 0 0 0 1px rgb(var(--color-contrast) / 0.12)",
      };
  const labelStyles: CSSProperties = {
    color: isActive
      ? "rgb(var(--color-brand) / 1)"
      : isComplete
      ? "rgb(var(--color-brand) / 0.9)"
      : "rgb(var(--color-contrast) / 0.65)",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-2 focus:outline-none"
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-transform duration-200 group-hover:-translate-y-0.5"
        style={badgeStyles}
      >
        {isComplete ? (
          <FiCheck className="h-4 w-4" />
        ) : isActive ? (
          <FiDisc className="h-4 w-4" />
        ) : (
          <FiCircle className="h-4 w-4" />
        )}
      </div>
      <span
        className="text-xs font-medium uppercase tracking-wide transition-transform duration-200 group-hover:-translate-y-0.5"
        style={labelStyles}
      >
        {label}
      </span>
    </button>
  );
};

const AddMemberPanel: React.FC<AddMemberPanelProps> = ({
  open,
  onClose,
  onSubmit,
  mode = "create",
  editingMember = null,
}) => {
  const [formState, setFormState] = useState<FormState>(() =>
    createEmptyFormState()
  );
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isMobile, setIsMobile] = useState(false);
  const dragControls = useDragControls();
  const totalSteps = stepDescriptors.length;

  useEffect(() => {
    if (!open) {
      return;
    }
    if (mode === "edit" && editingMember) {
      setFormState(toFormState(editingMember));
    } else {
      setFormState(createEmptyFormState());
    }
    setActiveStep(1);
  }, [editingMember, mode, open]);

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

  const canSubmit = useMemo(() => {
    if (!formState.name.trim()) return false;
    if (!formState.gender.trim()) return false;
    if (!formState.connection.trim()) return false;
    return true;
  }, [formState.name, formState.gender, formState.connection]);

  const isStepReady = useMemo(() => {
    switch (activeStep) {
      case 1:
        return (
          Boolean(formState.name.trim()) &&
          Boolean(formState.gender.trim()) &&
          Boolean(formState.connection.trim())
        );
      default:
        return true;
    }
  }, [activeStep, formState.name, formState.gender, formState.connection]);

  const nextButtonText =
    activeStep === totalSteps
      ? mode === "edit"
        ? "Save Changes"
        : "Create Member"
      : "Continue";

  const dragConstraints = useMemo(() => {
    if (!isMobile) {
      return undefined;
    }
    // allow a small downward pull so we can measure distance before closing
    return { top: 0, bottom: 360 };
  }, [isMobile]);

  const handleFieldChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      setFormState((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleFinalStepCompleted = useCallback(() => {
    if (!canSubmit) {
      setActiveStep(totalSteps);
      return;
    }

    const trimmedBirthday = formState.birthday.trim();
    const parsedBirthday =
      trimmedBirthday.length > 0
        ? new Date(`${trimmedBirthday}T00:00:00`)
        : undefined;
    const hasValidBirthday =
      parsedBirthday instanceof Date && !Number.isNaN(parsedBirthday.getTime());

    let parsedSpecialDates = formState.specialDates
      .map((entry) => {
        const trimmedLabel = entry.label.trim();
        if (!trimmedLabel) {
          return null;
        }
        const parsed = new Date(`${entry.date}T00:00:00`);
        if (Number.isNaN(parsed.getTime())) {
          return null;
        }
        return { label: trimmedLabel, date: parsed };
      })
      .filter(
        (entry): entry is { label: string; date: Date } => entry !== null
      );

    if (hasValidBirthday && parsedBirthday) {
      const birthdayIndex = parsedSpecialDates.findIndex(
        (entry) => entry.label.toLowerCase() === "birthday"
      );
      const birthdayEntry = { label: "Birthday", date: parsedBirthday };
      if (birthdayIndex >= 0) {
        parsedSpecialDates[birthdayIndex] = birthdayEntry;
      } else {
        parsedSpecialDates = [birthdayEntry, ...parsedSpecialDates];
      }
    } else {
      parsedSpecialDates = parsedSpecialDates.filter(
        (entry) => entry.label.toLowerCase() !== "birthday"
      );
    }

    const payload: AddMemberFormValues = {
      name: formState.name.trim(),
      gender:
        formState.gender.trim().charAt(0).toUpperCase() +
        formState.gender.trim().slice(1),
      connection: formState.connection.trim(),
    };

    const trimmedLikings = formState.likings.trim();
    if (trimmedLikings) {
      payload.likings = trimmedLikings;
    }
    if (parsedSpecialDates.length > 0) {
      payload.specialDates = parsedSpecialDates;
    }

    onSubmit(payload);
  }, [
    canSubmit,
    formState.name,
    formState.gender,
    formState.birthday,
    formState.connection,
    formState.likings,
    formState.specialDates,
    onSubmit,
    totalSteps,
  ]);

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

  // previews moved out of LikingsStep; not needed here
  // removed nameday/anniversary previews; dates are handled dynamically

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="add-member-panel"
          className="fixed inset-0 z-40 flex flex-col justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-t-3xl bg-white p-0 dark:bg-slate-900 md:rounded-3xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 40,
            }}
            drag={isMobile ? "y" : false}
            dragConstraints={dragConstraints}
            dragElastic={isMobile ? { top: 0, bottom: 0.35 } : 0}
            dragMomentum={false}
            dragControls={dragControls}
            dragListener={false}
            onDragEnd={handlePanelDragEnd}
          >
            <div className=" flex flex-col">
              <div className="flex justify-center sm:hidden pt-4">
                <div
                  role="presentation"
                  className="h-1.5 w-16  cursor-grab rounded-full bg-slate-300 transition dark:bg-slate-700 active:cursor-grabbing"
                  aria-hidden="true"
                  style={{ touchAction: "none" }}
                  onPointerDown={handleGrabPointerDown}
                />
              </div>
            </div>
            <Stepper
              initialStep={1}
              onStepChange={(step) => setActiveStep(step)}
              onFinalStepCompleted={handleFinalStepCompleted}
              nextButtonText={nextButtonText}
              nextButtonProps={{ disabled: !isStepReady }}
              backButtonText="Back"
              stepCircleContainerClassName="w-full"
              stepContainerClassName="justify-center p-0"
              contentClassName="pb-6"
              footerClassName=""
              renderStepIndicator={({ step, currentStep, onStepClick }) => (
                <StepBadge
                  key={step}
                  step={step}
                  currentStep={currentStep}
                  label={stepDescriptors[step - 1]?.title ?? `Step ${step}`}
                  onClick={() => {
                    if (step <= currentStep) {
                      onStepClick(step);
                    }
                  }}
                />
              )}
            >
              <Step>
                <BaseInfoStep
                  formState={formState}
                  onFieldChange={handleFieldChange}
                  onSelectConnection={(rel) => {
                    setFormState((prev) => ({
                      ...prev,
                      connection: rel,
                    }));
                  }}
                />
              </Step>
              <Step>
                <LikingsStep
                  formState={formState}
                  onToggleLike={(like) => {
                    setFormState((prev) => {
                      const current = prev.likings
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const exists = current
                        .map((s) => s.toLowerCase())
                        .includes(like.toLowerCase());
                      const next = exists
                        ? current.filter(
                            (s) => s.toLowerCase() !== like.toLowerCase()
                          )
                        : [...current, like];
                      return { ...prev, likings: next.join(", ") };
                    });
                  }}
                />
              </Step>
              <Step>
                <SpecialDatesStep
                  formState={formState}
                  onAddDate={(entry) =>
                    setFormState((prev) => ({
                      ...prev,
                      specialDates: [...prev.specialDates, entry],
                    }))
                  }
                  onRemoveDate={(index) =>
                    setFormState((prev) => ({
                      ...prev,
                      specialDates: prev.specialDates.filter(
                        (_, i) => i !== index
                      ),
                    }))
                  }
                  onUpdateDate={(index, entry) =>
                    setFormState((prev) => ({
                      ...prev,
                      specialDates: prev.specialDates.map((item, i) =>
                        i === index ? entry : item
                      ),
                    }))
                  }
                />
              </Step>
            </Stepper>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export type { AddMemberPanelProps };
export default AddMemberPanel;
