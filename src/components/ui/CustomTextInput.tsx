import React, { useId } from "react";
import type { InputHTMLAttributes, ForwardedRef } from "react";

interface CustomTextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  containerClassName?: string;
  labelClassName?: string;
  hideLabel?: boolean;
}

const baseInputClasses =
  "rounded-lg border border-accent-3 bg-primary px-3 py-2 text-sm text-contrast shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/70";

const baseLabelClasses =
  "text-xs font-semibold uppercase tracking-wide text-contrast/80";

function CustomTextInputComponent(
  {
    label,
    containerClassName = "",
    labelClassName = "",
    className = "",
    hideLabel = false,
    id,
    ...rest
  }: CustomTextInputProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label
      htmlFor={inputId}
      className={`flex flex-col gap-2 ${containerClassName}`}
    >
      <span
        className={`${baseLabelClasses} ${
          hideLabel ? "sr-only" : ""
        } ${labelClassName}`}
      >
        {label}
      </span>
      <input
        ref={ref}
        id={inputId}
        className={`${baseInputClasses} ${className}`}
        {...rest}
      />
    </label>
  );
}

const CustomTextInput = React.forwardRef(CustomTextInputComponent);

export default CustomTextInput;
