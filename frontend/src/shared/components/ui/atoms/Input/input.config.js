export const INPUT_VARIANTS = {
  DEFAULT: "default",
  ERROR: "error",
  SUCCESS: "success",
};

export const INPUT_SIZES = {
  sm: "h-8 px-2 text-sm",
  md: "h-10 px-3 text-sm",
  lg: "h-12 px-4 text-base",
};

export const INPUT_VARIANT_CLASSES = {
  [INPUT_VARIANTS.DEFAULT]: ["hover:border-[var(--border-strong)]"],
  [INPUT_VARIANTS.ERROR]: [
    "border-[var(--state-danger)]",
    "focus-visible:ring-[var(--state-danger)]",
  ],
  [INPUT_VARIANTS.SUCCESS]: [
    "border-[var(--state-success)]",
    "focus-visible:ring-[var(--state-success)]",
  ],
};
