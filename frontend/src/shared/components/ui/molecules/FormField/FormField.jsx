// libs
import clsx from "clsx";
import { useId } from "react";

// local
import { Input } from "../../atoms/Input";
import {
  FORM_FIELD_STATES,
  FORM_FIELD_LABEL,
  FORM_FIELD_HELPER,
} from "./formField.config";

/**
 * FormField – Molecule
 * Composes label + control + helper/error
 */
export function FormField({
  label,
  helperText,
  error,
  success,
  required = false,
  disabled = false,

  inputProps = {},
  children, // render prop
  className,
}) {
  const id = useId();

  const state = error
    ? FORM_FIELD_STATES.ERROR
    : success
      ? FORM_FIELD_STATES.SUCCESS
      : FORM_FIELD_STATES.DEFAULT;

  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <label htmlFor={id} className={clsx(FORM_FIELD_LABEL)}>
          {label}
          {required && (
            <span className="ml-1 text-[var(--state-danger)]">*</span>
          )}
        </label>
      )}

      {/* ✅ CONTROL SLOT */}
      {typeof children === "function" ? (
        children(id)
      ) : (
        <Input
          id={id}
          disabled={disabled}
          aria-invalid={state === FORM_FIELD_STATES.ERROR}
          variant={
            state === FORM_FIELD_STATES.ERROR
              ? "error"
              : state === FORM_FIELD_STATES.SUCCESS
                ? "success"
                : "default"
          }
          {...inputProps}
        />
      )}

      {(helperText || error || success) && (
        <p
          className={clsx(
            FORM_FIELD_HELPER.base,
            state === FORM_FIELD_STATES.ERROR
              ? FORM_FIELD_HELPER.error
              : state === FORM_FIELD_STATES.SUCCESS
                ? FORM_FIELD_HELPER.success
                : FORM_FIELD_HELPER.default,
          )}
        >
          {error || success || helperText}
        </p>
      )}
    </div>
  );
}
