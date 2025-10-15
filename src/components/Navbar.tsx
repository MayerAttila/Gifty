import { useEffect, useState } from "react";

const navLinks = [
  { href: "#", label: "Home" },
  { href: "#", label: "Features" },
  { href: "#", label: "Pricing" },
  { href: "#", label: "Contact" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <>
      <header className="bg-white shadow-sm dark:bg-slate-900">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <a href="#" className="text-lg font-semibold text-amber-600 dark:text-amber-400">
            Gifty
          </a>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 sm:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-amber-600 dark:hover:text-amber-400"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Activate ${theme === "dark" ? "light" : "dark"} theme`}
              aria-pressed={theme === "dark"}
              className="inline-flex items-center justify-center rounded-full border border-transparent bg-slate-100 p-2 text-slate-600 transition hover:border-amber-200 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-amber-400 dark:hover:text-amber-300 sm:h-10 sm:w-10"
            >
              {theme === "dark" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18a6 6 0 100-12 6 6 0 000 12z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M6 12H4m15.364-7.364l-1.414 1.414M6.05 17.95l-1.414 1.414m0-12.728L6.05 6.05m12.728 12.728l-1.414-1.414" />
                </svg>
              )}
            </button>
            <button className="hidden rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow transition-transform hover:-translate-y-0.5 hover:shadow-md sm:inline-flex">
              Get Started
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-amber-300 sm:hidden"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>
      {isMenuOpen && (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-72 max-w-full flex-col bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-slate-800">
              <span className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                Gifty
              </span>
              <button
                type="button"
                className="rounded-md p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-amber-300"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-4 px-4 py-6 text-sm font-medium text-slate-700 dark:text-slate-200">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-md px-3 py-2 transition hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-slate-800 dark:hover:text-amber-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Activate ${theme === "dark" ? "light" : "dark"} theme`}
                aria-pressed={theme === "dark"}
                className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-left text-sm transition hover:border-amber-200 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-slate-700 dark:hover:border-amber-400 dark:hover:text-amber-300"
              >
                <span>Toggle theme</span>
                {theme === "dark" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18a6 6 0 100-12 6 6 0 000 12z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M6 12H4m15.364-7.364l-1.414 1.414M6.05 17.95l-1.414 1.414m0-12.728L6.05 6.05m12.728 12.728l-1.414-1.414" />
                  </svg>
                )}
              </button>
              <button className="mt-auto rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow transition-transform hover:-translate-y-0.5 hover:shadow-md dark:bg-amber-500/90">
                Get Started
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
