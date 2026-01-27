export const BUTTON_VARIANTS = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
  GHOST: "ghost",
  OUTLINE: "outline",
};

export const BUTTON_SIZES = {
  sm: {
    base: "h-8 px-3 text-sm",
    icon: "h-8 w-8",
    spinner: "h-3 w-3",
  },
  md: {
    base: "h-10 px-4 text-sm",
    icon: "h-10 w-10",
    spinner: "h-4 w-4",
  },
  lg: {
    base: "h-12 px-6 text-base",
    icon: "h-12 w-12",
    spinner: "h-5 w-5",
  },
};

const PRIMARY = [
  "bg-[var(--accent)] text-[var(--accent-fg)]",
  "hover:bg-[var(--accent-hover)]",
  "active:bg-[var(--accent-active)]",
  "disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-text)]",
];

export const BUTTON_VARIANT_CLASSES = {
  [BUTTON_VARIANTS.PRIMARY]: PRIMARY,
  [BUTTON_VARIANTS.SECONDARY]: [
    "bg-[var(--bg-surface)] text-[var(--text-primary)]",
    "border border-[var(--border-default)]",
    "hover:bg-[var(--bg-elevated)]",
    "disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-text)]",
  ],
  [BUTTON_VARIANTS.GHOST]: [
    "bg-transparent text-[var(--text-primary)]",
    "hover:bg-[var(--bg-surface)]",
    "disabled:text-[var(--disabled-text)]",
  ],
  [BUTTON_VARIANTS.OUTLINE]: [
    "bg-transparent text-[var(--text-primary)]",
    "border border-[var(--border-default)]",
    "hover:bg-[var(--bg-surface)]",
    "disabled:text-[var(--disabled-text)]",
  ],
};
