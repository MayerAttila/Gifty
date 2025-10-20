import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import ThemeToggle from "./ui/ThemeToggle";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/Members", label: "Members" },
  { to: "/Members2", label: "Members2" },
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "transition-colors hover:text-amber-600 dark:hover:text-amber-400",
      isActive ? "text-amber-600 dark:text-amber-300" : undefined,
    ]
      .filter(Boolean)
      .join(" ");

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "rounded-md px-3 py-2 transition hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-slate-800 dark:hover:text-amber-300",
      isActive
        ? "bg-amber-50 text-amber-600 dark:bg-slate-800/70 dark:text-amber-300"
        : undefined,
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <>
      <header className="bg-white shadow-sm dark:bg-slate-900">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="text-lg font-semibold text-amber-600 dark:text-amber-400"
          >
            Gifty
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 sm:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={desktopLinkClass}
                end={link.to === "/"}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/pricing"
              className="hidden rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow transition-transform hover:-translate-y-0.5 hover:shadow-md sm:inline-flex"
            >
              View Pricing
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-amber-300 sm:hidden"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu className="h-6 w-6" />
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
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-4 px-4 py-6 text-sm font-medium text-slate-700 dark:text-slate-200">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={mobileLinkClass}
                  onClick={() => setIsMenuOpen(false)}
                  end={link.to === "/"}
                >
                  {link.label}
                </NavLink>
              ))}
              <ThemeToggle variant="menu" />
              <Link
                to="/pricing"
                className="mt-auto rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow transition-transform hover:-translate-y-0.5 hover:shadow-md dark:bg-amber-500/90"
                onClick={() => setIsMenuOpen(false)}
              >
                View Pricing
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
