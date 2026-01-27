// local imports
import { MOTION } from "../tokens/motion.tokens";
import { A11Y } from "../tokens/a11y.tokens";

/**
 * Base interaction behavior shared by all UI atoms
 */
export const INTERACTION_BASE = [
  "transition-colors",
  MOTION.normal,
  MOTION.easing,
  MOTION.noMotion,
  A11Y.focus,
  A11Y.disabled,
];

/**
 * For pressable controls (Button, IconButton)
 */
export const INTERACTION_PRESSABLE = [
  ...INTERACTION_BASE,
  MOTION.press, 
];

/**
 * For form controls (Input, Select, Textarea)
 * IMPORTANT: No scale / transform here
 */
export const INTERACTION_FIELD = [
  ...INTERACTION_BASE,
];
