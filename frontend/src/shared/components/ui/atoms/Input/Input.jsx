// libs import
import clsx from "clsx";

// local import
import { ATOM_BASE } from "../../config/atomBase.config";
import { INTERACTION_FIELD } from "../../config/interactions.config";
import { assertOneOf } from "../../utils/assert";
import {
  INPUT_VARIANTS,
  INPUT_VARIANT_CLASSES,
  INPUT_SIZES,
} from "./input.config";

/**
 * Input – UI Atom (stable, no focus jitter)
 */
export function Input({
  type = "text",
  size = "md",
  variant = INPUT_VARIANTS.DEFAULT,
  disabled = false,
  readOnly = false,
  className,
  ...rest
}) {
  assertOneOf("Input", "size", size, Object.keys(INPUT_SIZES));
  assertOneOf("Input", "variant", variant, Object.values(INPUT_VARIANTS));

  return (
    <input
      type={type}
      disabled={disabled}
      readOnly={readOnly}
      aria-disabled={disabled}
      className={clsx(
        ATOM_BASE,
        INTERACTION_FIELD,
        "w-full",
        "bg-[var(--bg-surface)] text-[var(--text-primary)]",
        "placeholder:text-[var(--text-muted)]",
        "border border-[var(--border-default)]",
        INPUT_SIZES[size],
        INPUT_VARIANT_CLASSES[variant],
        readOnly && "bg-[var(--bg-elevated)] cursor-default",
        className
      )}
      {...rest}
    />
  );
}
