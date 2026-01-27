const THEME_ATTR = "data-theme";

export function setTheme(themeId) {
  document.documentElement.setAttribute(THEME_ATTR, themeId);
}

export function getTheme() {
  return document.documentElement.getAttribute(THEME_ATTR);
}
