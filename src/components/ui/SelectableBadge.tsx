import React from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface SelectableBadgeProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label: ReactNode;
  isActive?: boolean;
  activeClassName?: string;
  inactiveClassName?: string;
  children?: ReactNode;
}

const baseClasses =
  "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-primary";
const defaultActiveClasses = "bg-brand text-primary shadow-sm shadow-brand/40";
const defaultInactiveClasses =
  "border border-accent-3 bg-primary text-contrast hover:border-accent-4 hover:text-brand";

const SelectableBadge: React.FC<SelectableBadgeProps> = ({
  label,
  isActive = false,
  activeClassName,
  inactiveClassName,
  className = "",
  children,
  type = "button",
  ...rest
}) => {
  const stateClass = isActive
    ? activeClassName ?? defaultActiveClasses
    : inactiveClassName ?? defaultInactiveClasses;

  const composedClassName = [baseClasses, stateClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={composedClassName} {...rest}>
      {children ?? label}
    </button>
  );
};

export default SelectableBadge;
