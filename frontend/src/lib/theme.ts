const THEME_KEY = "efas_theme";

export type Theme = "light" | "dark";

export function getTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === "dark" ? "dark" : "light";
}

export function setTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
}

export function toggleTheme() {
  const next: Theme = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

export function initTheme() {
  setTheme(getTheme());
}
