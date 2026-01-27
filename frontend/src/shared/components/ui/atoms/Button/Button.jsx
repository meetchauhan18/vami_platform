// libs import
import clsx from "clsx";

// local imports
import {
  BUTTON_VARIANTS,
  BUTTON_VARIANT_CLASSES,
  BUTTON_SIZES,
} from "./button.config";
import { assertOneOf } from "../../utils/assert";
import { ATOM_BASE } from "../../config/atomBase.config";
import { INTERACTION_PRESSABLE } from "../../config/interactions.config";

export function Button({
  children,
  variant = BUTTON_VARIANTS.PRIMARY,
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  fullWidth = false,
  startIcon,
  endIcon,
  iconOnly = false,
  ariaLabel,
  className,
  ...rest
}) {
  assertOneOf("Button", "variant", variant, Object.values(BUTTON_VARIANTS));
  assertOneOf("Button", "size", size, Object.keys(BUTTON_SIZES));

  if (iconOnly && !ariaLabel && import.meta.env.NODE_ENV !== "production") {
    throw new Error("Button: ariaLabel required for iconOnly");
  }

  const cfg = BUTTON_SIZES[size];
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-label={iconOnly ? ariaLabel : undefined}
      className={clsx(
  ATOM_BASE,
  INTERACTION_PRESSABLE, // ✅ correct
  "inline-flex items-center justify-center gap-2",
  fullWidth && "w-full",
  iconOnly ? cfg.icon : cfg.base,
  BUTTON_VARIANT_CLASSES[variant],
  className
)}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          className={clsx(
            "animate-spin rounded-full border-2 border-current border-t-transparent",
            cfg.spinner,
          )}
        />
      )}

      {!loading && startIcon && !iconOnly && <span>{startIcon}</span>}
      {!iconOnly && <span className={loading && "opacity-70"}>{children}</span>}
      {!loading && endIcon && !iconOnly && <span>{endIcon}</span>}
      {iconOnly && !loading && <span>{startIcon}</span>}
    </button>
  );
}
