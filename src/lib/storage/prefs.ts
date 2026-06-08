export type ThemePref = "dark" | "light" | "system";
const KEY = "json-table:prefs:v1";

export type LeftPaneTab = "tree" | "source";

export type Prefs = {
  theme: ThemePref;
  panels: [number, number];
  leftPaneTab: LeftPaneTab;
};

const DEFAULTS: Prefs = {
  theme: "dark",
  panels: [30, 70],
  leftPaneTab: "tree",
};

function migratePanels(panels: unknown): [number, number] {
  if (!Array.isArray(panels) || panels.length < 2) return DEFAULTS.panels;
  const left = Number(panels[0]);
  const grid = Number(panels[1]);
  if (!Number.isFinite(left) || !Number.isFinite(grid) || left <= 0 || grid <= 0) {
    return DEFAULTS.panels;
  }
  const total = left + grid;
  if (total <= 0) return DEFAULTS.panels;
  return [(left / total) * 100, (grid / total) * 100];
}

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Prefs & { inspectorOpen?: boolean }>;
    return {
      theme: parsed.theme ?? DEFAULTS.theme,
      leftPaneTab: parsed.leftPaneTab ?? DEFAULTS.leftPaneTab,
      panels: migratePanels(parsed.panels),
    };
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
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && sysDark);
  root.classList.toggle("dark", isDark);
}
