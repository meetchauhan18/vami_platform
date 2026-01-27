export function assertOneOf(component, prop, value, allowed) {
  if (import.meta.env.NODE_ENV !== "production" && !allowed.includes(value)) {
    throw new Error(
      `${component}: invalid ${prop} "${value}". Allowed: ${allowed.join(", ")}`,
    );
  }
}
