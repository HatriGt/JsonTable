export type ThemePref = "dark" | "light" | "system";
const KEY = "json-table:prefs:v1";

export type Prefs = {
  theme: ThemePref;
  panels: [number, number, number];
};

const DEFAULTS: Prefs = { theme: "dark", panels: [24, 52, 24] };

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function savePrefs(p: Partial<Prefs>) {
  if (typeof window === "undefined") return;
  const cur = loadPrefs();
  const next = { ...cur, ...p };
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function applyTheme(theme: ThemePref) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const sysDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && sysDark);
  root.classList.toggle("dark", isDark);
}