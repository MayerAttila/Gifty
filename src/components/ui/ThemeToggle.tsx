import { useCallback, useSyncExternalStore } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

type Theme = "light" | "dark";

const storageKey = "theme";
const subscribers = new Set<() => void>();

const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const readInitialTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem(storageKey);
  if (stored === "dark" || stored === "light") {
    return stored;
  }

  return getSystemTheme();
};

let currentTheme: Theme = readInitialTheme();

const applyTheme = (value: Theme) => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  if (value === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

if (typeof window !== "undefined") {
  applyTheme(currentTheme);
}

const notify = () => {
  subscribers.forEach((listener) => listener());
};

const setTheme = (value: Theme, persist = true) => {
  if (currentTheme === value) {
    return;
  }

  currentTheme = value;
  applyTheme(currentTheme);

  if (persist && typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, currentTheme);
  }

  notify();
};

const subscribe = (listener: () => void) => {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey) {
      if (event.newValue === "dark" || event.newValue === "light") {
        setTheme(event.newValue, false);
      } else {
        setTheme(getSystemTheme(), false);
      }
    }
  });

  window
    .matchMedia?.("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      const stored = window.localStorage.getItem(storageKey);
      if (stored !== "dark" && stored !== "light") {
        setTheme(event.matches ? "dark" : "light", false);
      }
    });
}

const useTheme = () => {
  const theme = useSyncExternalStore(
    subscribe,
    () => currentTheme,
    () => "light"
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return { theme, toggleTheme };
};

type ThemeToggleProps = {
  variant?: "icon" | "menu";
  className?: string;
};

const cls = (...classes: Array<string | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

const ThemeToggle = ({ variant = "icon", className }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const activateLabel = `Activate ${theme === "dark" ? "light" : "dark"} theme`;

  if (variant === "menu") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={activateLabel}
        aria-pressed={theme === "dark"}
        className={cls(
          "flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-left text-sm transition hover:border-amber-200 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-slate-700 dark:hover:border-amber-400 dark:hover:text-amber-300",
          className
        )}
      >
        <span>Toggle theme</span>
        {theme === "dark" ? (
          <FaMoon className="h-4 w-4" />
        ) : (
          <FaSun className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={activateLabel}
      aria-pressed={theme === "dark"}
      className={cls(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-slate-100 text-slate-600 transition hover:border-amber-200 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-amber-400 dark:hover:text-amber-300",
        className
      )}
    >
      {theme === "dark" ? (
        <FaMoon className="h-5 w-5" />
      ) : (
        <FaSun className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
