import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import ThemeToggle from "./ui/ThemeToggle";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/Members", label: "Members" },
  { to: "/calendar", label: "Calendar" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "transition-colors hover:text-brand/80",
      isActive ? "text-brand" : "text-contrast/80",
    ]
      .filter(Boolean)
      .join(" ");

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "rounded-md px-3 py-2 transition hover:bg-accent-2/60 hover:text-brand",
      isActive ? "bg-accent-2/80 text-brand" : "text-contrast",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <>
      <header className="bg-primary shadow-sm">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-brand">
            Gifty
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-contrast/70 sm:flex">
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
          <div className="relative ml-auto flex h-full w-72 max-w-full flex-col bg-primary shadow-2xl">
            <div className="flex items-center justify-between border-b border-accent-2/60 px-4 py-4 text-contrast">
              <span className="text-lg font-semibold text-brand">Gifty</span>
              <button
                type="button"
                className="rounded-md p-2 text-contrast transition hover:bg-accent-2/60 hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand/70"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-4 px-4 py-6 text-sm font-medium text-contrast">
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
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
