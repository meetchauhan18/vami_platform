export const FORM_FIELD_STATES = {
  DEFAULT: "default",
  ERROR: "error",
  SUCCESS: "success",
};

export const FORM_FIELD_LABEL = [
  "block",
  "mb-1",
  "text-sm",
  "font-medium",
  "text-[var(--text-primary)]",
];

export const FORM_FIELD_HELPER = {
  base: ["mt-1", "text-xs"],
  default: ["text-[var(--text-muted)]"],
  error: ["text-[var(--state-danger)]"],
  success: ["text-[var(--state-success)]"],
};
