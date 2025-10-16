import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { FiCheck, FiCircle, FiDisc, FiX } from "react-icons/fi";
import Stepper, { Step } from "./Stepper";

type MemberType = "family" | "friend" | "coworker" | "other";

type AddMemberFormValues = {
  name: string;
  gender: string;
  age: number;
  birthday: string;
  memberType: MemberType;
  relationship?: string;
  connectedSince?: string;
  preferences?: string;
};

interface AddMemberPanelProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AddMemberFormValues) => void;
}

type FormState = {
  name: string;
  gender: string;
  age: string;
  birthday: string;
  memberType: MemberType;
  relationship: string;
  connectedSince: string;
  preferences: string;
};

const emptyFormState: FormState = {
  name: "",
  gender: "male",
  age: "",
  birthday: "",
  memberType: "friend",
  relationship: "",
  connectedSince: "",
  preferences: "",
};

const stepDescriptors = [
  { title: "Option", subtitle: "Choose how you're connected." },
  { title: "Details", subtitle: "Tell us about the member." },
  { title: "Connected", subtitle: "Capture your relationship." },
  { title: "Dates", subtitle: "Never miss an important moment." },
  { title: "Liking", subtitle: "Personal touches for gifting." },
] as const;

const memberTypeOptions: Array<{
  label: string;
  value: MemberType;
  helper: string;
}> = [
  {
    label: "Family",
    value: "family",
    helper: "Parents, siblings, extended relatives.",
  },
  {
    label: "Friend",
    value: "friend",
    helper: "Close friends and chosen family.",
  },
  {
    label: "Coworker",
    value: "coworker",
    helper: "Teammates, managers, clients.",
  },
  {
    label: "Other",
    value: "other",
    helper: "Neighbors, mentors, community.",
  },
];

const formatDateForDisplay = (value: string) => {
  if (!value) return "";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString();
};

const StepBadge: React.FC<{
  step: number;
  currentStep: number;
  label: string;
  onClick: () => void;
}> = ({ step, currentStep, label, onClick }) => {
  const isActive = currentStep === step;
  const isComplete = currentStep > step;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-2 focus:outline-none"
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 ${
          isActive
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40"
            : isComplete
            ? "bg-emerald-300 text-emerald-900 shadow-lg shadow-emerald-300/30"
            : "bg-slate-800 text-slate-300 shadow-inner shadow-black/50 group-hover:bg-slate-700"
        }`}
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
        className={`text-xs font-medium uppercase tracking-wide transition-colors duration-200 ${
          isActive
            ? "text-emerald-400"
            : isComplete
            ? "text-slate-200"
            : "text-slate-400 group-hover:text-slate-200"
        }`}
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
}) => {
  const [formState, setFormState] = useState<FormState>(emptyFormState);
  const [activeStep, setActiveStep] = useState<number>(1);
  const totalSteps = stepDescriptors.length;

  useEffect(() => {
    if (open) {
      setFormState(emptyFormState);
      setActiveStep(1);
    }
  }, [open]);

  const parsedAge = useMemo(() => Number(formState.age), [formState.age]);
  const isAgeValid = useMemo(
    () => !Number.isNaN(parsedAge) && parsedAge >= 0,
    [parsedAge]
  );

  const canSubmit = useMemo(() => {
    if (!formState.name.trim()) return false;
    if (!formState.gender.trim()) return false;
    if (!isAgeValid) return false;
    return Boolean(formState.birthday);
  }, [formState.name, formState.gender, formState.birthday, isAgeValid]);

  const isStepReady = useMemo(() => {
    switch (activeStep) {
      case 1:
        return Boolean(formState.memberType);
      case 2:
        return (
          Boolean(formState.name.trim()) &&
          Boolean(formState.gender.trim()) &&
          isAgeValid
        );
      case 4:
        return Boolean(formState.birthday);
      case 5:
        return canSubmit;
      default:
        return true;
    }
  }, [
    activeStep,
    formState.memberType,
    formState.name,
    formState.gender,
    formState.birthday,
    isAgeValid,
    canSubmit,
  ]);

  const nextButtonText =
    activeStep === totalSteps ? "Create Member" : "Continue";

  const handleFieldChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      setFormState((prev) => ({
        ...prev,
        [name]: name === "age" ? value.replace(/[^0-9]/g, "") : value,
      }));
    },
    []
  );

  const handleMemberTypeSelect = useCallback((type: MemberType) => {
    setFormState((prev) => ({
      ...prev,
      memberType: type,
    }));
  }, []);

  const handleFinalStepCompleted = useCallback(() => {
    if (!canSubmit) {
      setActiveStep(totalSteps);
      return;
    }

    const payload: AddMemberFormValues = {
      name: formState.name.trim(),
      gender:
        formState.gender.trim().charAt(0).toUpperCase() +
        formState.gender.trim().slice(1),
      age: parsedAge,
      birthday: formState.birthday,
      memberType: formState.memberType,
      relationship: formState.relationship.trim()
        ? formState.relationship.trim()
        : undefined,
      connectedSince: formState.connectedSince || undefined,
      preferences: formState.preferences.trim()
        ? formState.preferences.trim()
        : undefined,
    };

    onSubmit(payload);
  }, [
    canSubmit,
    formState.name,
    formState.gender,
    formState.birthday,
    formState.memberType,
    formState.relationship,
    formState.connectedSince,
    formState.preferences,
    parsedAge,
    onSubmit,
    totalSteps,
  ]);

  const birthdayPreview = useMemo(
    () => formatDateForDisplay(formState.birthday),
    [formState.birthday]
  );
  const connectedPreview = useMemo(
    () => formatDateForDisplay(formState.connectedSince),
    [formState.connectedSince]
  );

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
            className="relative z-10 max-h-[95vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 40,
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Add New Member
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Use the steps to capture the essentials we’ll track.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <span className="sr-only">Close panel</span>
                <FiX className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <Stepper
              initialStep={1}
              onStepChange={(step) => setActiveStep(step)}
              onFinalStepCompleted={handleFinalStepCompleted}
              nextButtonText={nextButtonText}
              nextButtonProps={{ disabled: !isStepReady }}
              backButtonText="Back"
              stepCircleContainerClassName="bg-slate-950/80 dark:bg-slate-900/70"
              stepContainerClassName="flex flex-wrap justify-center gap-4 sm:gap-6"
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
                <OptionStep
                  memberType={formState.memberType}
                  onSelectType={handleMemberTypeSelect}
                />
              </Step>
              <Step>
                <DetailsStep
                  formState={formState}
                  onFieldChange={handleFieldChange}
                  isAgeValid={isAgeValid}
                />
              </Step>
              <Step>
                <ConnectedStep
                  formState={formState}
                  onFieldChange={handleFieldChange}
                />
              </Step>
              <Step>
                <DatesStep
                  birthday={formState.birthday}
                  onFieldChange={handleFieldChange}
                />
              </Step>
              <Step>
                <LikingStep
                  formState={formState}
                  onFieldChange={handleFieldChange}
                  birthdayPreview={birthdayPreview}
                  connectedPreview={connectedPreview}
                />
              </Step>
            </Stepper>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export type { AddMemberFormValues, AddMemberPanelProps, MemberType };
export default AddMemberPanel;

interface OptionStepProps {
  memberType: MemberType;
  onSelectType: (type: MemberType) => void;
}

const OptionStep: React.FC<OptionStepProps> = ({
  memberType,
  onSelectType,
}) => {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Choose how you're connected
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          This helps group reminders and gifting ideas later.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {memberTypeOptions.map((option) => {
          const isSelected = option.value === memberType;
          return (
            <button
              type="button"
              key={option.value}
              onClick={() => onSelectType(option.value)}
              className={`rounded-2xl border p-4 text-left transition ${
                isSelected
                  ? "border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-200/50 dark:border-emerald-600 dark:bg-emerald-900/30"
                  : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-emerald-700"
              }`}
            >
              <span className="block text-base font-semibold text-slate-800 dark:text-slate-100">
                {option.label}
              </span>
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                {option.helper}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface DetailsStepProps {
  formState: FormState;
  onFieldChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  isAgeValid: boolean;
}

const DetailsStep: React.FC<DetailsStepProps> = ({
  formState,
  onFieldChange,
  isAgeValid,
}) => {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Member details
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Add the essentials so we can personalize suggestions.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Name
          </span>
          <input
            required
            name="name"
            type="text"
            value={formState.name}
            onChange={onFieldChange}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-600"
          />
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Gender
          </legend>
          <div className="flex flex-wrap gap-3">
            {["Male", "Female"].map((option) => {
              const value = option.toLowerCase();
              const isSelected = formState.gender.toLowerCase() === value;
              return (
                <label
                  key={value}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                    isSelected
                      ? "border-emerald-400 bg-emerald-50 font-semibold shadow-sm shadow-emerald-200/70 dark:border-emerald-600 dark:bg-emerald-900/30"
                      : "border-slate-300 bg-white hover:border-emerald-200 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-900"
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    checked={isSelected}
                    onChange={onFieldChange}
                    className="accent-emerald-500"
                  />
                  <span className="text-slate-700 dark:text-slate-200">
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
      <label className="flex flex-col gap-1 sm:max-w-[200px]">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Age
        </span>
        <input
          required
          name="age"
          type="text"
          inputMode="numeric"
          value={formState.age}
          onChange={onFieldChange}
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-600"
        />
      </label>
      {!isAgeValid && formState.age && (
        <p className="text-sm text-red-500">
          Please enter a valid age using digits only.
        </p>
      )}
    </div>
  );
};

interface ConnectedStepProps {
  formState: FormState;
  onFieldChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const ConnectedStep: React.FC<ConnectedStepProps> = ({
  formState,
  onFieldChange,
}) => {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Capture your relationship
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          These details help tailor reminders and tone.
        </p>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          How are you connected?
        </span>
        <input
          name="relationship"
          type="text"
          placeholder="e.g. College roommate, Mentor"
          value={formState.relationship}
          onChange={onFieldChange}
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-600"
        />
      </label>
      <label className="flex flex-col gap-1 sm:max-w-[220px]">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Connected since
        </span>
        <input
          name="connectedSince"
          type="date"
          value={formState.connectedSince}
          onChange={onFieldChange}
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-600"
        />
      </label>
    </div>
  );
};

interface DatesStepProps {
  birthday: string;
  onFieldChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const DatesStep: React.FC<DatesStepProps> = ({ birthday, onFieldChange }) => {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Important dates
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Track birthdays or anniversaries you want reminders for.
        </p>
      </div>
      <label className="flex flex-col gap-1 sm:max-w-[220px]">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Birthday
        </span>
        <input
          required
          name="birthday"
          type="date"
          value={birthday}
          onChange={onFieldChange}
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-600"
        />
      </label>
    </div>
  );
};

interface LikingStepProps {
  formState: FormState;
  onFieldChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  birthdayPreview: string;
  connectedPreview: string;
}

const LikingStep: React.FC<LikingStepProps> = ({
  formState,
  onFieldChange,
  birthdayPreview,
  connectedPreview,
}) => {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Personal touches
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Add gift ideas, preferences, or anything else worth remembering.
        </p>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Likes &amp; gift inspiration
        </span>
        <textarea
          name="preferences"
          rows={4}
          value={formState.preferences}
          onChange={onFieldChange}
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-600"
          placeholder="Favorite colors, hobbies, go-to treats..."
        />
      </label>
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-700 shadow-inner dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          Quick review
        </h4>
        <dl className="mt-2 space-y-1">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-300">Type</dt>
            <dd className="font-medium capitalize text-slate-800 dark:text-slate-100">
              {formState.memberType}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-300">Name</dt>
            <dd className="font-medium text-slate-800 dark:text-slate-100">
              {formState.name || "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-300">Birthday</dt>
            <dd className="font-medium text-slate-800 dark:text-slate-100">
              {birthdayPreview || "—"}
            </dd>
          </div>
          {(formState.relationship || connectedPreview) && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-300">Connection</dt>
              <dd className="text-right font-medium text-slate-800 dark:text-slate-100">
                {formState.relationship || "—"}
                {connectedPreview ? ` · since ${connectedPreview}` : ""}
              </dd>
            </div>
          )}
          {formState.preferences && (
            <div>
              <dt className="text-slate-500 dark:text-slate-300">Likes</dt>
              <dd className="mt-1 text-slate-700 dark:text-slate-200">
                {formState.preferences}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
};
