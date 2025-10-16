import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type AddMemberFormValues = {
  name: string;
  gender: string;
  age: number;
  birthday: string;
};

interface AddMemberPanelProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AddMemberFormValues) => void;
}

const emptyFormState = {
  name: "",
  gender: "",
  age: "",
  birthday: "",
};

const AddMemberPanel: React.FC<AddMemberPanelProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [formState, setFormState] = useState(emptyFormState);

  useEffect(() => {
    if (open) {
      setFormState(emptyFormState);
    }
  }, [open]);

  const isSubmitDisabled = useMemo(() => {
    if (!formState.name.trim()) return true;
    if (!formState.gender.trim()) return true;
    if (!formState.birthday) return true;
    const parsedAge = Number(formState.age);
    return Number.isNaN(parsedAge) || parsedAge < 0;
  }, [formState]);

  const handleFieldChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setFormState((prev) => ({
        ...prev,
        [name]: name === "age" ? value.replace(/[^0-9]/g, "") : value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const parsedAge = Number(formState.age);
      if (Number.isNaN(parsedAge) || parsedAge < 0) {
        return;
      }
      onSubmit({
        name: formState.name.trim(),
        gender: formState.gender.trim(),
        age: parsedAge,
        birthday: formState.birthday,
      });
    },
    [formState, onSubmit]
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
            className="relative z-10 rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
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
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                Add New Member
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <span className="sr-only">Close panel</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 0 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              noValidate
            >
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Name
                </span>
                <input
                  required
                  name="name"
                  type="text"
                  value={formState.name}
                  onChange={handleFieldChange}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-600"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Gender
                </span>
                <input
                  required
                  name="gender"
                  type="text"
                  value={formState.gender}
                  onChange={handleFieldChange}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-600"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Age
                </span>
                <input
                  required
                  name="age"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={formState.age}
                  onChange={handleFieldChange}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-600"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Birthday
                </span>
                <input
                  required
                  name="birthday"
                  type="date"
                  value={formState.birthday}
                  onChange={handleFieldChange}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-600"
                />
              </label>
              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-400/70 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  Create Member
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export type { AddMemberFormValues, AddMemberPanelProps };
export default AddMemberPanel;
