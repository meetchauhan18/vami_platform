// libs imports
import { useEffect } from "react";

// local imports
import { setTheme } from "@/core/theme/themeManager.js";

const DEFAULT_THEME = "vami-light";

export function ThemeInitializer({ children }) {
  useEffect(() => {
    // 1. Read persisted theme (cookie later)
    // 2. Fallback to default
    setTheme(DEFAULT_THEME);
  }, []);

  return children;
}
